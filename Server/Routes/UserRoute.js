import express from "express";
import profileUpload from "../Auth/profileUploadMiddleware.js";

import {
  register,
  login,
  getProfiles,
  getAllUsers,
  updateUser,
  uploadProfileImage,
  deleteProfileImage,
  updateUserStatus,
  adminUpdateUserProfile,
  deleteMyAccount,
} from "../Controllers/UserControllers.js";

import verifyToken from "../Auth/authMiddleware.js";
import adminOnly from "../Auth/adminMiddleware.js";

const router = express.Router();

// =====================================================
// AUTH / USER ROUTES
// =====================================================

router.post("/register", register);

router.post("/login", login);

// Get logged-in user profile
router.get("/profiles/:id", verifyToken, getProfiles);

// Get all users - Admin
router.get("/all", verifyToken, adminOnly, getAllUsers);

// Update user
router.put("/updateuser/:id", verifyToken, updateUser);

// =====================================================
// PROFILE IMAGE
// =====================================================

router.post(
  "/profile-image",
  verifyToken,
  profileUpload.single("profileImage"),
  uploadProfileImage,
);

router.delete("/profile-image", verifyToken, deleteProfileImage);

// =====================================================
// ACCOUNT
// =====================================================

// User deactivates own account
router.delete("/delete-account", verifyToken, deleteMyAccount);

// =====================================================
// ADMIN USER MANAGEMENT
// =====================================================

// Activate / deactivate / restore user
router.patch("/:id/status", verifyToken, adminOnly, updateUserStatus);

// Admin edit user profile
router.put(
  "/:id/admin-profile",
  verifyToken,
  adminOnly,
  adminUpdateUserProfile,
);

export default router;
