import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// =====================================================
// HELPER
// =====================================================

const createRandomPassword = async () => {
  const randomPassword = crypto.randomBytes(32).toString("hex");
  return await bcrypt.hash(randomPassword, 10);
};

// =====================================================
// GOOGLE STRATEGY
// =====================================================

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },

    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const intent = req.query.state === "signup" ? "signup" : "login";

        const googleEmail = profile.emails?.[0]?.value?.toLowerCase()?.trim();

        // ---------------------------------------------
        // Check user by Google ID
        // ---------------------------------------------

        let user = await User.findOne({
          googleId: profile.id,
        });

        // ---------------------------------------------
        // If not found by Google ID, check email
        // ---------------------------------------------

        if (!user && googleEmail) {
          user = await User.findOne({
            email: googleEmail,
          });
        }

        // =================================================
        // SIGNUP FLOW
        // =================================================

        if (intent === "signup") {
          // Existing account
          if (user) {
            return done(null, false, {
              message: "ACCOUNT_ALREADY_EXISTS",
            });
          }

          if (!googleEmail) {
            return done(null, false, {
              message: "EMAIL_NOT_AVAILABLE",
            });
          }

          const hashedPassword = await createRandomPassword();

          const newUser = await User.create({
            name: profile.displayName || "Google User",
            email: googleEmail,
            password: hashedPassword,

            phone: null,
            gender: null,
            dateOfBirth: null,

            provider: "google",
            googleId: profile.id,

            profileImage: profile.photos?.[0]?.value || "",

            isActive: true,
          });

          // Temporary flag available in callback
          newUser._oauthAction = "signup";

          return done(null, newUser);
        }

        // =================================================
        // LOGIN FLOW
        // =================================================

        if (!user) {
          return done(null, false, {
            message: "ACCOUNT_NOT_FOUND",
          });
        }

        if (!user.isActive) {
          return done(null, false, {
            message: "ACCOUNT_DEACTIVATED",
          });
        }

        // ---------------------------------------------
        // Link Google ID if account exists by email
        // ---------------------------------------------

        if (!user.googleId) {
          user.googleId = profile.id;

          if (!user.profileImage) {
            user.profileImage = profile.photos?.[0]?.value || "";
          }

          /*
            IMPORTANT:
            Do NOT change provider here.

            If existing account is provider "local",
            it should continue supporting password login.
          */

          await user.save();
        }

        user._oauthAction = "login";

        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);

        return done(error, null);
      }
    },
  ),
);

// =====================================================
// FACEBOOK STRATEGY
// =====================================================

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APPID,
      clientSecret: process.env.FACEBOOK_SECRETID,

      callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,

      // Email removed for now because Facebook
      // is currently rejecting the email scope.
      profileFields: ["id", "displayName", "photos"],

      passReqToCallback: true,
    },

    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const intent = req.query.state === "signup" ? "signup" : "login";

        // ---------------------------------------------
        // Find account by Facebook ID
        // ---------------------------------------------

        let user = await User.findOne({
          facebookId: profile.id,
        });

        // =================================================
        // SIGNUP FLOW
        // =================================================

        if (intent === "signup") {
          if (user) {
            return done(null, false, {
              message: "ACCOUNT_ALREADY_EXISTS",
            });
          }

          const hashedPassword = await createRandomPassword();

          /*
            Temporary email because Facebook email
            permission is currently unavailable.

            Later when Facebook email permission is
            configured, replace this with real email.
          */

          const facebookEmail = `${profile.id}@facebook.local`;

          // Safety check
          const existingEmail = await User.findOne({
            email: facebookEmail,
          });

          if (existingEmail) {
            return done(null, false, {
              message: "ACCOUNT_ALREADY_EXISTS",
            });
          }

          const newUser = await User.create({
            name: profile.displayName || "Facebook User",

            email: facebookEmail,

            password: hashedPassword,

            phone: null,
            gender: null,
            dateOfBirth: null,

            provider: "facebook",
            facebookId: profile.id,

            profileImage: profile.photos?.[0]?.value || "",

            isActive: true,
          });

          newUser._oauthAction = "signup";

          return done(null, newUser);
        }

        // =================================================
        // LOGIN FLOW
        // =================================================

        if (!user) {
          return done(null, false, {
            message: "ACCOUNT_NOT_FOUND",
          });
        }

        if (!user.isActive) {
          return done(null, false, {
            message: "ACCOUNT_DEACTIVATED",
          });
        }

        user._oauthAction = "login";

        return done(null, user);
      } catch (error) {
        console.error("Facebook Strategy Error:", error);

        return done(error, null);
      }
    },
  ),
);

export default passport;
