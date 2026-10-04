import express from "express";

import {
  getMyWinnings,
  getAllWinners,
  uploadWinnerProof,
  verifyWinnerProof,
  markWinnerPaid,
} from "../Controllers/winnerController.js";

import verifyToken from "../Auth/authMiddleware.js";
import adminOnly from "../Auth/adminMiddleware.js";
import proofUpload from "../config/multer.js";

const router = express.Router();

// USER - MY WINNINGS
router.get("/me", verifyToken, getMyWinnings);

// USER - UPLOAD PROOF
router.post(
  "/:winnerId/proof",
  verifyToken,
  proofUpload.single("proof"),
  uploadWinnerProof,
);

// ADMIN - ALL WINNERS
router.get("/", verifyToken, adminOnly, getAllWinners);

// ADMIN - APPROVE / REJECT
router.put("/:winnerId/verify", verifyToken, adminOnly, verifyWinnerProof);

// ADMIN - MARK PAID
router.put("/:winnerId/paid", verifyToken, adminOnly, markWinnerPaid);

export default router;
