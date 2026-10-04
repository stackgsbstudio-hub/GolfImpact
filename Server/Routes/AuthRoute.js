import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import { register, login } from "../Controllers/UserControllers.js";

const router = express.Router();

const FRONTEND_URL = "http://localhost:5173";

// =====================================================
// NORMAL REGISTER
// =====================================================

router.post("/register", register);

// =====================================================
// NORMAL LOGIN
// =====================================================

router.post("/login", login);

// =====================================================
// CREATE JWT
// =====================================================

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// =====================================================
// GOOGLE
// =====================================================

// Google OAuth start
router.get("/google", (req, res, next) => {
  const intent = req.query.intent === "signup" ? "signup" : "login";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: intent,
  })(req, res, next);
});

// Google callback
router.get(
  "/google/callback",

  (req, res, next) => {
    passport.authenticate(
      "google",
      {
        session: false,
      },

      (error, user, info) => {
        if (error) {
          console.error("Google OAuth Error:", error);

          return res.redirect(`${FRONTEND_URL}/login?error=google`);
        }

        // ---------------------------------------------
        // OAuth authentication rejected
        // ---------------------------------------------

        if (!user) {
          const reason = info?.message;

          if (reason === "ACCOUNT_ALREADY_EXISTS") {
            return res.redirect(`${FRONTEND_URL}/sign-up?error=account_exists`);
          }

          if (reason === "ACCOUNT_NOT_FOUND") {
            return res.redirect(
              `${FRONTEND_URL}/login?error=account_not_found`,
            );
          }

          if (reason === "ACCOUNT_DEACTIVATED") {
            return res.redirect(
              `${FRONTEND_URL}/login?error=account_deactivated`,
            );
          }

          if (reason === "EMAIL_NOT_AVAILABLE") {
            return res.redirect(
              `${FRONTEND_URL}/sign-up?error=email_not_available`,
            );
          }

          return res.redirect(`${FRONTEND_URL}/login?error=google`);
        }

        // ---------------------------------------------
        // Active account check
        // ---------------------------------------------

        if (!user.isActive) {
          return res.redirect(
            `${FRONTEND_URL}/login?error=account_deactivated`,
          );
        }

        // ---------------------------------------------
        // Create GolfImpact JWT
        // ---------------------------------------------

        const token = createToken(user);

        const action = user._oauthAction === "signup" ? "signup" : "login";

        return res.redirect(
          `${FRONTEND_URL}/oauth-success?token=${encodeURIComponent(
            token,
          )}&action=${action}`,
        );
      },
    )(req, res, next);
  },
);

// =====================================================
// FACEBOOK
// =====================================================

// Facebook OAuth start
router.get("/facebook", (req, res, next) => {
  const intent = req.query.intent === "signup" ? "signup" : "login";

  passport.authenticate("facebook", {
    session: false,

    // DO NOT add scope:["email"] right now.
    // Facebook is rejecting it in your current setup.

    state: intent,
  })(req, res, next);
});

// Facebook callback
router.get(
  "/facebook/callback",

  (req, res, next) => {
    passport.authenticate(
      "facebook",
      {
        session: false,
      },

      (error, user, info) => {
        if (error) {
          console.error("Facebook OAuth Error:", error);

          return res.redirect(`${FRONTEND_URL}/login?error=facebook`);
        }

        // ---------------------------------------------
        // OAuth authentication rejected
        // ---------------------------------------------

        if (!user) {
          const reason = info?.message;

          if (reason === "ACCOUNT_ALREADY_EXISTS") {
            return res.redirect(`${FRONTEND_URL}/sign-up?error=account_exists`);
          }

          if (reason === "ACCOUNT_NOT_FOUND") {
            return res.redirect(
              `${FRONTEND_URL}/login?error=account_not_found`,
            );
          }

          if (reason === "ACCOUNT_DEACTIVATED") {
            return res.redirect(
              `${FRONTEND_URL}/login?error=account_deactivated`,
            );
          }

          return res.redirect(`${FRONTEND_URL}/login?error=facebook`);
        }

        // ---------------------------------------------
        // Active account check
        // ---------------------------------------------

        if (!user.isActive) {
          return res.redirect(
            `${FRONTEND_URL}/login?error=account_deactivated`,
          );
        }

        // ---------------------------------------------
        // Create GolfImpact JWT
        // ---------------------------------------------

        const token = createToken(user);

        const action = user._oauthAction === "signup" ? "signup" : "login";

        return res.redirect(
          `${FRONTEND_URL}/oauth-success?token=${encodeURIComponent(
            token,
          )}&action=${action}`,
        );
      },
    )(req, res, next);
  },
);

export default router;
