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

  
};
