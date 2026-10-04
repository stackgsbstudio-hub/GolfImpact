import express from "express";
import verifyToken from "../Auth/authMiddleware.js";
import { getUserDashboard } from "../Controllers/DashboardController.js";

const router = express.Router();

router.get("/user", verifyToken, getUserDashboard);

export default router;
