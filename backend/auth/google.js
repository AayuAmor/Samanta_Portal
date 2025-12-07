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
          }
          );
      }
    )
  );

  
};
