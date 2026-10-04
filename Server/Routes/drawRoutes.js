import express from "express";

import {
  getDraws,
  createRandomDraw,
  calculatePrizePool,
  simulateDraw,
  publishDraw,
  calculateWinners,
  distributePrizes,
  getMyParticipationSummary,
} from "../Controllers/drawController.js";

import verifyToken from "../Auth/authMiddleware.js";
import adminOnly from "../Auth/adminMiddleware.js";

const router = express.Router();

// DISTRIBUTE PRIZES
router.post(
  "/:drawId/distribute-prizes",
  verifyToken,
  adminOnly,
  distributePrizes,
);

// GET ALL DRAWS

router.get("/", verifyToken, adminOnly, getDraws);

// CREATE DRAW
router.post("/", verifyToken, adminOnly, createRandomDraw);

// CALCULATE PRIZE POOL
router.post(
  "/:drawId/calculate-prize-pool",
  verifyToken,
  adminOnly,
  calculatePrizePool,
);

// SIMULATE
router.post("/:drawId/simulate", verifyToken, adminOnly, simulateDraw);

// PUBLISH
router.post("/:drawId/publish", verifyToken, adminOnly, publishDraw);

// CALCULATE OFFICIAL WINNERS
router.post(
  "/:drawId/calculate-winners",
  verifyToken,
  adminOnly,
  calculateWinners,
);

router.get("/my-participation", verifyToken, getMyParticipationSummary);

export default router;
