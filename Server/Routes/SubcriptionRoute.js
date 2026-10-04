import express from "express";

import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getMySubscription,
  cancelSubscription,
  getAllSubscriptions,
  expireSubscriptions,
  adminCancelSubscription,
} from "../Controllers/SubcriptionController.js";

import verifyToken from "../Auth/authMiddleware.js";
import adminOnly from "../Auth/adminMiddleware.js";

const router = express.Router();

// =====================================================
// USER SUBSCRIPTION ROUTES
// =====================================================

// Create Razorpay subscription order
router.post("/create-order", verifyToken, createSubscriptionOrder);

// Verify Razorpay payment
router.post("/verify", verifyToken, verifySubscriptionPayment);

// Get logged-in user's subscription
router.get("/my-subscription", verifyToken, getMySubscription);

// Cancel logged-in user's subscription
router.patch("/cancel", verifyToken, cancelSubscription);

// =====================================================
// ADMIN SUBSCRIPTION ROUTES
// =====================================================

// Get all subscriptions
router.get("/subscriptions", verifyToken, adminOnly, getAllSubscriptions);

// Cancel a specific user's subscription
router.patch(
  "/subscriptions/:id/cancel",
  verifyToken,
  adminOnly,
  adminCancelSubscription,
);

// Mark expired subscriptions as expired
router.patch(
  "/expire-subscriptions",
  verifyToken,
  adminOnly,
  expireSubscriptions,
);

export default router;
