const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

module.exports = function setupGoogleStrategy(passportInstance, db) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = `${
    process.env.SERVER_PUBLIC_URL || "http://localhost:3000"
  }/auth/google/callback`;

  if (!clientID || !clientSecret) {
    console.warn(
      "Google OAuth not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"
    );
    return;
  }
  passportInstance.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      function (accessToken, refreshToken, profile, done) {
        const email =
          Array.isArray(profile.emails) && profile.emails[0]
            ? profile.emails[0].value
            : undefined;
        const displayName = profile.displayName;
        const googleId = profile.id;

        if (!email) {
          return done(null, false, { message: "No email provided by Google" });
        }

        // Check if user exists with this Google ID
        db.get(
          "SELECT id, username, email, fullName FROM users WHERE provider = ? AND providerId = ?",
          ["google", googleId],
          (err, existingUser) => {
            if (err) {
              return done(err);
            }

            if (existingUser) {
              // User exists, update last login
              db.run("UPDATE users SET lastLogin = ? WHERE id = ?", [
                new Date().toISOString(),
                existingUser.id,
              ]);
              return done(null, existingUser);
            }
            // Check if email already exists (registered via password)
            db.get(
              "SELECT id, username, email, fullName FROM users WHERE email = ?",
              [email],
              (err, emailUser) => {
                if (err) {
                  return done(err);
                }

                if (emailUser) {
                  // Email exists, link Google account
                  db.run(
                    "UPDATE users SET provider = ?, providerId = ?, lastLogin = ? WHERE id = ?",
                    [
                      "google",
                      googleId,
                      new Date().toISOString(),
                      emailUser.id,
                    ],
                    function (err) {
                      if (err) {
                        console.error("Error linking Google account:", err);
                        return done(err);
                      }
                      db.get(
                        "SELECT id, username, email, fullName FROM users WHERE id = ?",
                        [emailUser.id],
                        (err, updatedUser) => {
                          if (err) return done(err);
                          done(null, updatedUser);
                        }
                      );
                    }
                  );
                } else {
                  // Create new user from Google account
                  const username =
                    email.split("@")[0] +
                    "_" +
                    Math.random().toString(36).substr(2, 9);
                  const newUser = {
                    username,
                    email,
                    fullName: displayName,
                    provider: "google",
                    providerId: googleId,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                  };

                  db.run(
                    `INSERT INTO users (username, email, fullName, provider, providerId, createdAt, lastLogin)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                      newUser.username,
                      newUser.email,
                      newUser.fullName,
                      newUser.provider,
                      newUser.providerId,
                      newUser.createdAt,
                      newUser.lastLogin,
                    ],
                    function (err) {
                      if (err) {
                        console.error("Error creating new Google user:", err);
                        return done(err);
                      }
                      const createdUser = {
                        id: this.lastID,
                        username: newUser.username,
                        email: newUser.email,
                        fullName: newUser.fullName,
                      };
                      done(null, createdUser);
                    }
                  );
                }
              }
            );
          }
        );
      }
    )
  );
};
