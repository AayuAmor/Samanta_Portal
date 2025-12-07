const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const bcrypt = require("bcryptjs");
// Load Google OAuth strategy from separate module
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = express();

app.use(express.json());
// CORS for frontend origin with cookies
const CLIENT_URL = process.env.CLIENT_URL || "http://127.0.0.1:5500";
const ALLOWED_ORIGINS = new Set([
  CLIENT_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
]);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
// Minimal CSP to allow frontend and API connections
const API_ORIGIN =
  process.env.SERVER_PUBLIC_URL ||
  `http://localhost:${process.env.PORT || 3000}`;
app.use((req, res, next) => {
  const policy = [
    "default-src 'self'",
    `connect-src 'self' ${API_ORIGIN} ${CLIENT_URL}`,
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "frame-ancestors 'self'",
  ].join("; ");
  res.setHeader("Content-Security-Policy", policy);
  next();
});
// Session for auth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "samanta-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Quiet Chrome DevTools probe
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(204).end();
});

// SQLite setup
const DB_FILE = path.join(__dirname, "data", "messages.sqlite");
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      ip TEXT,
      createdAt TEXT NOT NULL
    )`
  );

  // Create users table for authentication
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      passwordHash TEXT,
      provider TEXT,
      providerId TEXT,
      createdAt TEXT NOT NULL,
      lastLogin TEXT,
      UNIQUE(provider, providerId)
    )`
  );

  // Create a separate index for faster lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);

  // Complaints captured from the police complaint form
  db.run(
    `CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caseId TEXT NOT NULL,
      fullName TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      incidentDate TEXT,
      dateUnknown INTEGER DEFAULT 0,
      gender TEXT NOT NULL,
      location TEXT NOT NULL,
      complaintType TEXT NOT NULL,
      description TEXT NOT NULL,
      accused TEXT,
      attachments TEXT,
      createdAt TEXT NOT NULL
    )`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_complaints_caseId ON complaints(caseId)`
  );
});

// Case ID generator aligned with frontend format (#SCYYYYMMDD-1234)
function generateCaseId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `#SC${year}${month}${day}-${random}`;
}

// Passport serialize/deserialize
passport.serializeUser((user, done) => {
  // Store user ID in session
  done(null, { id: user.id, provider: user.provider });
});

passport.deserializeUser((obj, done) => {
  // Fetch user from database by ID
  db.get(
    "SELECT id, username, email, fullName, provider FROM users WHERE id = ?",
    [obj.id],
    (err, user) => {
      if (err) {
        console.error("Deserialize error:", err);
        return done(err);
      }
      done(null, user);
    }
  );
});

// Initialize Google strategy (after db is ready)
try {
  require(path.join(__dirname, "auth", "google"))(passport, db);
} catch (e) {
  console.warn("Failed to initialize Google OAuth strategy:", e.message);
}

// Auth routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login.html?auth=failed`,
  }),
  (req, res) => res.redirect(`${CLIENT_URL}/login.html?auth=success`)
);

app.get("/auth/logout", (req, res) => {
  req.logout?.(() => {});
  req.session.destroy?.(() => {});
  res.redirect(`${CLIENT_URL}/login.html?auth=loggedout`);
});

// Current user
app.get("/api/me", (req, res) => {
  if (req.user) return res.json({ ok: true, user: req.user });
  res.status(401).json({ ok: false });
});

// POST /api/auth/register - Register with username and password
app.post("/api/auth/register", (req, res) => {
  const { username, email, fullName, password, confirmPassword } =
    req.body || {};

  // Validation
  if (!username || !email || !fullName || !password || !confirmPassword) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      error: "Passwords do not match.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long.",
    });
  }

  if (!/^([^@\s]+)@([^@\s]+)\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({
      error:
        "Username must be 3-20 characters, alphanumeric and underscores only.",
    });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, passwordHash) => {
    if (err) {
      console.error("Bcrypt error:", err);
      return res
        .status(500)
        .json({ error: "Server error during registration." });
    }

    const user = {
      username: username.trim(),
      email: email.trim(),
      fullName: fullName.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const sql = `INSERT INTO users (username, email, fullName, passwordHash, createdAt, lastLogin)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      user.username,
      user.email,
      user.fullName,
      user.passwordHash,
      user.createdAt,
      user.lastLogin,
    ];

    db.run(sql, params, function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          if (err.message.includes("username")) {
            return res.status(409).json({ error: "Username already exists." });
          } else if (err.message.includes("email")) {
            return res.status(409).json({ error: "Email already registered." });
          }
        }
        console.error("DB insert error:", err);
        return res
          .status(500)
          .json({ error: "Database error during registration." });
      }

      // Create session and return user
      const createdUser = {
        id: this.lastID,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      };

      req.login(createdUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Error creating session." });
        }
        res.json({ success: true, user: createdUser });
      });
    });
  });
});

// POST /api/auth/login - Login with username/email and password
app.post("/api/auth/login", (req, res) => {
  const { credential, password } = req.body || {};

  if (!credential || !password) {
    return res.status(400).json({
      error: "Username/email and password are required.",
    });
  }

  // Find user by username or email
  db.get(
    "SELECT id, username, email, fullName, passwordHash FROM users WHERE (username = ? OR email = ?) AND passwordHash IS NOT NULL",
    [credential.trim(), credential.trim()],
    (err, user) => {
      if (err) {
        console.error("DB query error:", err);
        return res.status(500).json({ error: "Server error." });
      }

      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid username/email or password." });
      }

      // Compare passwords
      bcrypt.compare(password, user.passwordHash, (err, isMatch) => {
        if (err) {
          console.error("Bcrypt compare error:", err);
          return res.status(500).json({ error: "Server error." });
        }

        if (!isMatch) {
          return res
            .status(401)
            .json({ error: "Invalid username/email or password." });
        }

        // Update last login
        db.run("UPDATE users SET lastLogin = ? WHERE id = ?", [
          new Date().toISOString(),
          user.id,
        ]);

        // Create session
        const sessionUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        };

        req.login(sessionUser, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ error: "Error creating session." });
          }
          res.json({ success: true, user: sessionUser });
        });
      });
    }
  );
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Error logging out." });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Error destroying session." });
      }
      res.json({ success: true, message: "Logged out successfully." });
    });
  });
});

// Police complaint intake (matches frontend form fields)
app.post("/api/complaints", (req, res) => {
  const {
    fullName,
    address,
    phone,
    email,
    incidentDate,
    dateUnknown,
    gender,
    location,
    type,
    description,
    accused,
  } = req.body || {};

  if (
    !fullName ||
    !address ||
    !phone ||
    !gender ||
    !location ||
    !type ||
    !description
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!/^[0-9]{7,15}$/.test(String(phone).trim())) {
    return res.status(400).json({ error: "Phone must be 7-15 digits." });
  }

  if (email && !/^([^@\s]+)@([^@\s]+)\.[^@\s]+$/.test(String(email).trim())) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (!dateUnknown && !incidentDate) {
    return res
      .status(400)
      .json({ error: "Incident date is required unless marked unknown." });
  }

  const entry = {
    caseId: generateCaseId(),
    fullName: String(fullName).trim(),
    address: String(address).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : null,
    incidentDate: dateUnknown ? null : String(incidentDate).trim(),
    dateUnknown: dateUnknown ? 1 : 0,
    gender: String(gender).trim(),
    location: String(location).trim(),
    complaintType: String(type).trim(),
    description: String(description).trim(),
    accused: accused ? String(accused).trim() : null,
    attachments: null, // Placeholder for future file uploads
    createdAt: new Date().toISOString(),
  };

  const sql = `INSERT INTO complaints (caseId, fullName, address, phone, email, incidentDate, dateUnknown, gender, location, complaintType, description, accused, attachments, createdAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    entry.caseId,
    entry.fullName,
    entry.address,
    entry.phone,
    entry.email,
    entry.incidentDate,
    entry.dateUnknown,
    entry.gender,
    entry.location,
    entry.complaintType,
    entry.description,
    entry.accused,
    entry.attachments,
    entry.createdAt,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("DB insert error (complaint):", err);
      return res
        .status(500)
        .json({ error: "Database error while saving complaint." });
    }
    res.json({
      success: true,
      caseId: entry.caseId,
      complaint: { id: this.lastID, ...entry },
    });
  });
});

app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      error: "All fields (name, email, subject, message) are required.",
    });
  }
  // Basic email format check
  if (!/^([^@\s]+)@([^@\s]+)\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const entry = {
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    ip: req.ip,
    createdAt: new Date().toISOString(),
  };

  const sql = `INSERT INTO messages (name, email, subject, message, ip, createdAt)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [
    entry.name,
    entry.email,
    entry.subject,
    entry.message,
    entry.ip,
    entry.createdAt,
  ];
  db.run(sql, params, function (err) {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, entry: { id: this.lastID, ...entry } });
  });
});

// GET /api/contact - list stored messages (DEV ONLY - consider securing)
app.get("/api/contact", (req, res) => {
  db.all("SELECT * FROM messages ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error("DB read error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
