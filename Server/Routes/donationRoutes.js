import express from "express";

import {
  createDonationOrder,
  verifyDonationPayment,
  getMyDonations,
} from "../Controllers/donationController.js";

import verifyToken from "../Auth/authMiddleware.js";

const router = express.Router();

router.post("/create-order", verifyToken, createDonationOrder);

router.post("/verify", verifyToken, verifyDonationPayment);

router.get("/me", verifyToken, getMyDonations);

export default router;
