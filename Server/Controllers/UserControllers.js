import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { sendEmail } from "../utils/emailService.js";

// ==============================
// Register User
// ==============================

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth } = req.body;

    // Required Fields Validation
    if (!name || !email || !password || !phone || !gender || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    // Password Validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Phone Validation (India)
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    // Gender Validation
    if (!["male", "female", "other"].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender.",
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isNaN(Date.parse(dateOfBirth))) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }

    // Create User
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone,
      gender: gender.toLowerCase(),
      dateOfBirth,
      provider: "local",
      isActive: true,
    });

    // Welcome Email
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to GolfImpact",

        text: `Hi ${user.name}, welcome to GolfImpact! Your account has been created successfully.`,

        html: `
      <div style="
        background:#09111B;
        padding:32px;
        font-family:Arial,sans-serif;
        color:#ffffff;
      ">
        <div style="
          max-width:600px;
          margin:auto;
          background:#0D1520;
          border-radius:18px;
          padding:32px;
        ">
          <h1 style="
            color:#9A8DFF;
            margin-top:0;
          ">
            GolfImpact
          </h1>

          <h2 style="color:#ffffff;">
            Welcome to GolfImpact!
          </h2>

          <p style="color:#D1D5DB;font-size:16px;">
            Hi ${user.name},
          </p>

          <p style="color:#D1D5DB;font-size:16px;">
            Your GolfImpact account has been created successfully.
          </p>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:20px;
            margin:24px 0;
          ">
            <p style="margin:8px 0;">
              <strong>Name:</strong> ${user.name}
            </p>

            <p style="margin:8px 0;">
              <strong>Email:</strong> ${user.email}
            </p>
          </div>

          <p style="color:#D1D5DB;">
            You can now sign in, manage your golf scores,
            participate in eligible draws and support charities.
          </p>

          <p style="
            color:#9A8DFF;
            font-weight:bold;
            margin-top:24px;
          ">
            Play. Win. Make a Difference.
          </p>
        </div>
      </div>
    `,
      });
    } catch (emailError) {
      console.error("Welcome Email Error:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==============================
// Login User
// ==============================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find User
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check Active Status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_DEACTIVATED",
        message:
          "Your account has been deactivated. Please contact support to restore your account.",
      });
    }

    // Local Login Only
    if (user.provider !== "local") {
      return res.status(400).json({
        success: false,
        message: `Please login using ${user.provider}.`,
      });
    }

    // Compare Password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// get profile
export const getProfiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile find successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};

// update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // User sirf apna profile update kar sakta hai
    if (req.user.id.toString() !== id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile.",
      });
    }

    const { name, phone, gender, dateOfBirth } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Name validation
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      user.name = name.trim();
    }

    // Phone validation
    if (phone !== undefined) {
      if (phone !== "") {
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid phone number.",
          });
        }
      }

      user.phone = phone || null;
    }

    // Gender validation
    if (gender !== undefined && gender !== "") {
      if (!["male", "female", "other"].includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid gender.",
        });
      }

      user.gender = gender.toLowerCase();
    }

    // Date of birth validation
    if (dateOfBirth !== undefined && dateOfBirth !== "") {
      if (isNaN(Date.parse(dateOfBirth))) {
        return res.status(400).json({
          success: false,
          message: "Invalid date of birth.",
        });
      }

      user.dateOfBirth = dateOfBirth;
    }

    await user.save();

    console.log("DOB RECEIVED:", dateOfBirth);
    console.log("DOB SAVED:", user.dateOfBirth);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.profileImage = `/uploads/profiles/${req.file.filename}`;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("PROFILE IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to upload profile image.",
    });
  }
};

// ==============================
// Delete Profile Image
// ==============================

export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.profileImage) {
      return res.status(400).json({
        success: false,
        message: "No profile image to remove.",
      });
    }

    // Delete local file if it exists
    if (user.profileImage.startsWith("/uploads/profiles/")) {
      const relativePath = user.profileImage.replace(/^\/+/, "");
      const filePath = path.resolve(relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.profileImage = "";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image removed successfully.",
      profileImage: "",
    });
  } catch (error) {
    console.error("DELETE PROFILE IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove profile image.",
    });
  }
};

// ==============================
// ADMIN: UPDATE USER STATUS
// ==============================

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.isActive = isActive;

    if (isActive) {
      // Restoring account
      user.deletedAt = null;
    } else {
      // Deactivating account
      user.deletedAt = user.deletedAt || new Date();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully."
        : "User deactivated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update User Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const adminUpdateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, phone, gender, dateOfBirth } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use.",
        });
      }

      user.email = email.toLowerCase().trim();
    }

    if (name !== undefined) {
      const cleanName = name.trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      user.name = cleanName;
    }

    if (phone !== undefined) {
      user.phone = phone?.trim() || null;
    }

    if (gender !== undefined) {
      if (
        gender !== null &&
        gender !== "" &&
        !["male", "female", "other"].includes(gender)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid gender.",
        });
      }

      user.gender = gender || null;
    }

    if (dateOfBirth !== undefined) {
      if (!dateOfBirth) {
        user.dateOfBirth = null;
      } else {
        const parsedDate = new Date(dateOfBirth);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid date of birth.",
          });
        }

        user.dateOfBirth = parsedDate;
      }
    }

    await user.save();

    const safeUser = await User.findById(id)
      .select("-password -otp -otpExpire")
      .populate("selectedCharity");

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
      user: safeUser,
    });
  } catch (error) {
    console.error("Admin Update User Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==============================
// USER: DEACTIVATE OWN ACCOUNT
// ==============================

export const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account cannot be deleted from this option.",
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Account is already deactivated.",
      });
    }

    // Soft delete
    user.isActive = false;
    user.deletedAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your account has been deactivated successfully. Contact support if you want to restore your account.",
    });
  } catch (error) {
    console.error("Delete My Account Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
