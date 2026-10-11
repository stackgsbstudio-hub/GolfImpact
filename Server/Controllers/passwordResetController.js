import crypto from "node:crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";

const OTP_VALIDITY = 5 * 60 * 1000;
const RESEND_COOLDOWN = 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const genericMessage =
  "If an eligible account exists, a verification code will be sent.";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({
      email,
      provider: "local",
      isActive: true,
    });

    if (!user) {
      return res.json({
        success: true,
        message: genericMessage,
      });
    }

    const now = Date.now();

    if (
      user.otpLastSentAt &&
      now - new Date(user.otpLastSentAt).getTime() < RESEND_COOLDOWN
    ) {
      return res.json({
        success: true,
        message: genericMessage,
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.otp = hashValue(otp);
    user.otpExpire = new Date(now + OTP_VALIDITY);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date(now);
    user.passwordResetGrantHash = null;

    await user.save();

    const result = await sendEmail({
      to: user.email,
      subject: "GolfImpact Password Reset OTP",
      text: `Your GolfImpact verification code is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;color:#111827">
          <h2>GolfImpact Password Reset</h2>
          <p>Use the verification code below to reset your password.</p>
          <h1 style="letter-spacing:8px;color:#482ECE">${otp}</h1>
          <p>This OTP expires in <strong>5 minutes</strong>.</p>
          <p>Never share this code with anyone.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    if (!result.success) {
      await User.updateOne(
        { _id: user._id, otp: hashValue(otp) },
        {
          $set: {
            otp: null,
            otpExpire: null,
          },
        },
      );

      console.error("Password reset OTP email delivery failed.");
    }

    return res.json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process request.",
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const otp = String(req.body?.otp || "");

    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification details.",
      });
    }

    const user = await User.findOne({
      email,
      provider: "local",
      isActive: true,
    });

    if (!user || !user.otp || !user.otpExpire) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    if (new Date(user.otpExpire).getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new code.",
      });
    }

    if ((user.otpAttempts || 0) >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new OTP.",
      });
    }

    const providedHash = Buffer.from(hashValue(otp), "hex");
    const storedHash = Buffer.from(user.otp, "hex");

    const matches =
      storedHash.length === providedHash.length &&
      crypto.timingSafeEqual(storedHash, providedHash);

    if (!matches) {
      await User.updateOne(
        {
          _id: user._id,
          otp: user.otp,
          otpExpire: { $gt: new Date() },
          otpAttempts: { $lt: MAX_ATTEMPTS },
        },
        { $inc: { otpAttempts: 1 } },
      );

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // Short-lived reset grant, separate from login JWT.
    const resetGrant = crypto.randomBytes(32).toString("hex");

    const updated = await User.findOneAndUpdate(
      {
        _id: user._id,
        otp: user.otp,
        otpExpire: { $gt: new Date() },
        otpAttempts: { $lt: MAX_ATTEMPTS },
      },
      {
        $set: {
          otp: null,
          otpExpire: null,
          otpAttempts: MAX_ATTEMPTS,
          passwordResetGrantHash: hashValue(resetGrant),
        },
      },
      { new: true },
    );

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully.",
      resetGrant,
    });
  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const { password, resetGrant } = req.body;

    if (
      !isValidEmail(email) ||
      typeof resetGrant !== "string" ||
      !/^[a-f0-9]{64}$/.test(resetGrant) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset request.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      {
        email,
        provider: "local",
        isActive: true,
        passwordResetGrantHash: hashValue(resetGrant),
      },
      {
        $set: {
          password: passwordHash,
          passwordResetGrantHash: null,
          otp: null,
          otpExpire: null,
          otpAttempts: 0,
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset session invalid. Please request a new OTP.",
      });
    }

    return res.json({
      success: true,
      message: "Password changed successfully. Please login.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};
