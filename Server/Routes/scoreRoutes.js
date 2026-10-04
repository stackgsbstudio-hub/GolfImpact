import express from "express";

import {
  addScore,
  getScores,
  updateScore,
  deleteScore,
  adminGetUserScores,
  adminUpdateScore,
  adminDeleteScore,
} from "../Controllers/scoreController.js";

import verifyToken from "../Auth/authMiddleware.js";
import activeSubscriptionOnly from "../Auth/activeSubscriptionMiddleware.js";
import adminOnly from "../Auth/adminMiddleware.js";

const router = express.Router();

// ==========================================
// ADMIN SCORE ROUTES
// ==========================================

router.get("/admin/user/:userId", verifyToken, adminOnly, adminGetUserScores);

router.put("/admin/:id", verifyToken, adminOnly, adminUpdateScore);

router.delete("/admin/:id", verifyToken, adminOnly, adminDeleteScore);

// ==========================================
// USER SCORE ROUTES
// ==========================================

router.post("/", verifyToken, activeSubscriptionOnly, addScore);

router.get("/", verifyToken, activeSubscriptionOnly, getScores);

router.put("/:id", verifyToken, activeSubscriptionOnly, updateScore);

router.delete("/:id", verifyToken, activeSubscriptionOnly, deleteScore);

export default router;
