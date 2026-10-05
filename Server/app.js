import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import "./config/passport.js";
import DbConnection from "./dbConnections/DB.js";

import UserRoutes from "./Routes/UserRoute.js";
import AuthRoute from "./Routes/AuthRoute.js";
import PaymentRoutes from "./Routes/SubcriptionRoute.js";
import scoreRoutes from "./Routes/scoreRoutes.js";
import charityRoutes from "./Routes/charityRoutes.js";
import donationRoutes from "./Routes/donationRoutes.js";
import drawRoutes from "./Routes/drawRoutes.js";
import winnerRoutes from "./Routes/winnerRoutes.js";
import DashboardRoutes from "./Routes/DashboardRoute.js";

// =====================================================
// ENV CONFIG
// =====================================================

dotenv.config();

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// ES MODULE DIRECTORY PATH
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: ["http://localhost:5173", "https://golf-impact-cma7.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// =====================================================
// LEGACY STATIC FILES
// =====================================================
// Keep temporarily for old local /uploads records.
// New uploads use Cloudinary.
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================================
// DATABASE
// =====================================================

DbConnection();

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/dashboard", DashboardRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GolfImpact API Running",
  });
});

export default app;
