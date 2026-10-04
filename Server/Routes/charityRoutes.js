import express from "express";

import {
  addCharity,
  getCharities,
  getCharityById,
  getFeaturedCharity,
  updateCharity,
  deleteCharity,
  selectCharity,
  getMyCharity,
  adminGetAllCharities,
  adminGetCharityById,
  uploadCharityImages,
} from "../Controllers/charityController.js";

import verifyToken from "../Auth/authMiddleware.js";
import activeSubscriptionOnly from "../Auth/activeSubscriptionMiddleware.js";
import adminOnly from "../Auth/adminMiddleware.js";
import { charityUpload } from "../config/multer.js";

const router = express.Router();

// ================================
// PUBLIC ROUTES
// ================================

// Charity directory + search/filter
router.get("/", getCharities);

// Featured charity
router.get("/featured", getFeaturedCharity);

router.get("/admin/all", verifyToken, adminOnly, adminGetAllCharities);

router.get("/admin/:id", verifyToken, adminOnly, adminGetCharityById);

// ================================
// ACTIVE SUBSCRIBER ROUTES
// ================================

// Current selected charity
router.get("/me", verifyToken, activeSubscriptionOnly, getMyCharity);

// Select/change charity + contribution %
router.put("/select", verifyToken, activeSubscriptionOnly, selectCharity);

// ================================
// ADMIN ROUTES
// ================================

router.post("/", verifyToken, adminOnly, addCharity);

router.put("/:id", verifyToken, adminOnly, updateCharity);

router.delete("/:id", verifyToken, adminOnly, deleteCharity);

router.get("/:id", getCharityById);

router.post(
  "/upload-images",
  verifyToken,
  adminOnly,
  charityUpload.array("images", 10),
  uploadCharityImages,
);

export default router;
