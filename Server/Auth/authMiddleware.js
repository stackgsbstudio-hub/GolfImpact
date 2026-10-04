import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyToken = async (req, res, next) => {
  try {
    // =====================================================
    // CHECK AUTHORIZATION HEADER
    // =====================================================

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_MISSING",
        message: "Access denied. Please login again.",
      });
    }

    // =====================================================
    // GET TOKEN
    // =====================================================

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_MISSING",
        message: "Access denied. Please login again.",
      });
    }

    // =====================================================
    // VERIFY JWT
    // =====================================================

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // =====================================================
    // CHECK USER STILL EXISTS
    // =====================================================

    const user = await User.findById(decoded.id).select(
      "_id email role isActive",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Your account no longer exists. Please login again.",
      });
    }

    // =====================================================
    // CHECK ACCOUNT STATUS
    // =====================================================

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        code: "ACCOUNT_DEACTIVATED",
        message:
          "Your account has been deactivated. Please contact admin support.",
      });
    }

    // =====================================================
    // ATTACH CURRENT USER TO REQUEST
    // =====================================================

    // Current DB role is used instead of trusting
    // the role stored in an older JWT.
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // =====================================================
    // TOKEN EXPIRED
    // =====================================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Your session has expired. Please login again.",
      });
    }

    // =====================================================
    // INVALID JWT
    // =====================================================

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Your session is invalid. Please login again.",
      });
    }

    // =====================================================
    // OTHER ERROR
    // =====================================================

    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      code: "AUTHENTICATION_ERROR",
      message: "Authentication failed.",
    });
  }
};

export default verifyToken;
