import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

import Donation from "../models/Donation.js";
import Charity from "../models/Charity.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// CREATE DONATION ORDER
// =====================================================

export const createDonationOrder = async (req, res) => {
  try {
    const { charityId, amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(charityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid charity ID.",
      });
    }

    const donationAmount = Number(amount);

    if (
      !Number.isFinite(donationAmount) ||
      donationAmount < 1 ||
      donationAmount > 1000000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid donation amount.",
      });
    }

    const charity = await Charity.findOne({
      _id: charityId,
      active: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    // Razorpay works in paise
    const amountInPaise = Math.round(donationAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `don_${Date.now()}`,
      notes: {
        charityId: charity._id.toString(),
        userId: req.user.id.toString(),
      },
    });

    const donation = await Donation.create({
      user: req.user.id,
      charity: charity._id,
      amount: donationAmount,
      currency: "INR",
      status: "created",
      orderId: order.id,
    });

    return res.status(201).json({
      success: true,
      message: "Donation order created successfully.",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      donationId: donation._id,

      charity: {
        _id: charity._id,
        name: charity.name,
      },

      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Donation Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create donation order.",
    });
  }
};

// =====================================================
// VERIFY DONATION PAYMENT
// =====================================================

export const verifyDonationPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !donationId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID.",
      });
    }

    const donation = await Donation.findOne({
      _id: donationId,
      user: req.user.id,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    if (donation.orderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID does not match.",
      });
    }

    // Duplicate verification protection
    if (
      donation.status === "paid" &&
      donation.paymentId === razorpay_payment_id
    ) {
      return res.status(200).json({
        success: true,
        message: "Donation payment already verified.",
        donation,
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    donation.status = "paid";
    donation.paymentId = razorpay_payment_id;
    donation.paymentSignature = razorpay_signature;
    donation.paidAt = new Date();

    await donation.save();

    const populatedDonation = await Donation.findById(donation._id)
      .populate("charity", "name image category location")
      .populate("user", "name email");

    return res.status(200).json({
      success: true,
      message: "Donation payment verified successfully.",
      donation: populatedDonation,
    });
  } catch (error) {
    console.error("Verify Donation Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify donation payment.",
    });
  }
};

// =====================================================
// GET MY DONATIONS
// =====================================================

export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      user: req.user.id,
      status: "paid",
    })
      .populate("charity", "name image category location")
      .sort({
        paidAt: -1,
      });

    const totalDonated = donations.reduce(
      (total, donation) => total + Number(donation.amount || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      count: donations.length,
      totalDonated,
      donations,
    });
  } catch (error) {
    console.error("Get My Donations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch donations.",
    });
  }
};
