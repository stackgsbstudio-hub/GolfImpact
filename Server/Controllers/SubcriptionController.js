import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";

import Subscription from "../models/subscriptionModel.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// EMAIL TEMPLATE - SUBSCRIPTION ACTIVATED
// ======================================================

const sendSubscriptionActivatedEmail = async (user, subscription) => {
  if (!user?.email) return;

  const startDate = subscription.startDate
    ? new Date(subscription.startDate).toLocaleDateString("en-IN")
    : "-";

  const expiryDate = subscription.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString("en-IN")
    : "-";

  await sendEmail({
    to: user.email,

    subject: "Your GolfImpact Subscription is Active",

    text: `Hi ${user.name || "Golfer"}, your ${
      subscription.plan
    } GolfImpact subscription has been activated successfully.`,

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
            Subscription Activated
          </h2>

          <p style="
            color:#D1D5DB;
            font-size:16px;
          ">
            Hi ${user.name || "Golfer"},
          </p>

          <p style="
            color:#D1D5DB;
            font-size:16px;
          ">
            Your GolfImpact subscription has been activated successfully.
          </p>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:20px;
            margin:24px 0;
          ">

            <p style="margin:8px 0;">
              <strong>Plan:</strong>
              ${subscription.plan}
            </p>

            <p style="margin:8px 0;">
              <strong>Amount:</strong>
              ₹${subscription.amount}
            </p>

            <p style="margin:8px 0;">
              <strong>Start Date:</strong>
              ${startDate}
            </p>

            <p style="margin:8px 0;">
              <strong>Expiry Date:</strong>
              ${expiryDate}
            </p>

          </div>

          <p style="
            color:#9A8DFF;
            font-weight:bold;
          ">
            Play. Win. Make a Difference.
          </p>

        </div>
      </div>
    `,
  });
};

// ======================================================
// EMAIL TEMPLATE - SUBSCRIPTION CANCELLED
// ======================================================

const sendSubscriptionCancelledEmail = async (
  user,
  subscription,
  cancelledByAdmin = false,
) => {
  if (!user?.email) return;

  const expiryDate = subscription.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString("en-IN")
    : "-";

  await sendEmail({
    to: user.email,

    subject: "GolfImpact Subscription Cancelled",

    text: `Hi ${user.name || "Golfer"}, your GolfImpact subscription has been cancelled.`,

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
            Subscription Cancelled
          </h2>

          <p style="color:#D1D5DB;">
            Hi ${user.name || "Golfer"},
          </p>

          <p style="color:#D1D5DB;">
            ${
              cancelledByAdmin
                ? "Your GolfImpact subscription has been cancelled by the administrator."
                : "Your GolfImpact subscription has been cancelled successfully."
            }
          </p>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:20px;
            margin:24px 0;
          ">

            <p style="margin:8px 0;">
              <strong>Plan:</strong>
              ${subscription.plan}
            </p>

            <p style="margin:8px 0;">
              <strong>Expiry Date:</strong>
              ${expiryDate}
            </p>

          </div>

          ${
            cancelledByAdmin
              ? `
                <p style="color:#9CA3AF;">
                  Please contact GolfImpact support if you believe this was unexpected.
                </p>
              `
              : `
                <p style="color:#9CA3AF;">
                  Thank you for being part of GolfImpact.
                </p>
              `
          }

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
};

// ======================================================
// CREATE SUBSCRIPTION ORDER
// ======================================================

export const createSubscriptionOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    const plans = {
      monthly: {
        amount: 1000,
        duration: 30,
      },

      yearly: {
        amount: 9600,
        duration: 365,
      },
    };

    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan.",
      });
    }

    const now = new Date();

    await Subscription.updateMany(
      {
        userId: req.user.id,
        status: "active",
        expiryDate: {
          $ne: null,
          $lte: now,
        },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    // Check existing active subscription
    const existingActiveSubscription = await Subscription.findOne({
      userId: req.user.id,

      status: "active",

      expiryDate: {
        $ne: null,
        $gt: now,
      },
    });

    if (existingActiveSubscription) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active subscription. Renewal is available after expiry.",
      });
    }

    // Create Razorpay order
    const options = {
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save subscription as created
    const subscription = await Subscription.create({
      userId: req.user.id,
      plan,
      amount: selectedPlan.amount,
      status: "created",
      OrderId: order.id,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription order created successfully.",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      subscriptionId: subscription._id,

      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create subscription order.",
    });
  }
};

// ======================================================
// VERIFY SUBSCRIPTION PAYMENT
// ======================================================

export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !subscriptionId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required.",
      });
    }

    // Find subscription belonging to logged-in user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user.id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    // Validate Razorpay order ID
    if (subscription.OrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID does not match.",
      });
    }

    // Duplicate verification protection
    if (
      subscription.status === "active" &&
      subscription.PaymentId === razorpay_payment_id
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        subscription,
      });
    }

    // Generate expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Validate payment signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Deactivate any other active subscription
    await Subscription.updateMany(
      {
        userId: req.user.id,

        status: "active",

        _id: {
          $ne: subscription._id,
        },
      },

      {
        $set: {
          status: "inactive",
        },
      },
    );

    // Calculate subscription dates
    const startDate = new Date();

    const expiryDate = new Date(startDate);

    if (subscription.plan === "monthly") {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }

    if (subscription.plan === "yearly") {
      expiryDate.setDate(expiryDate.getDate() + 365);
    }

    // Activate subscription
    subscription.status = "active";
    subscription.PaymentId = razorpay_payment_id;
    subscription.PaymentSignature = razorpay_signature;
    subscription.startDate = startDate;
    subscription.expiryDate = expiryDate;

    await subscription.save();

    // ------------------------------------------
    // SEND ACTIVATION EMAIL
    // ------------------------------------------

    try {
      const user = await User.findById(req.user.id).select("name email");

      if (user?.email) {
        await sendSubscriptionActivatedEmail(user, subscription);
      }
    } catch (emailError) {
      // Payment must remain successful even if email fails
      console.error("Subscription Activation Email Error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated.",
      subscription,
    });
  } catch (error) {
    console.error("Verify Subscription Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify subscription payment.",
    });
  }
};

// ======================================================
// GET MY SUBSCRIPTION
// ======================================================

export const getMySubscription = async (req, res) => {
  try {
    const now = new Date();

    // Automatically expire old active subscriptions
    await Subscription.updateMany(
      {
        userId: req.user.id,
        status: "active",

        expiryDate: {
          $ne: null,
          $lte: now,
        },
      },

      {
        $set: {
          status: "expired",
        },
      },
    );

    // Find current active subscription
    let subscription = await Subscription.findOne({
      userId: req.user.id,

      status: "active",

      expiryDate: {
        $gt: now,
      },
    }).sort({
      expiryDate: -1,
    });

    // Otherwise return latest subscription
    if (!subscription) {
      subscription = await Subscription.findOne({
        userId: req.user.id,
      }).sort({
        createdAt: -1,
      });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found.",
      });
    }

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Get Subscription Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================================
// CANCEL MY SUBSCRIPTION
// ======================================================

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.id,

      status: "active",

      expiryDate: {
        $gt: new Date(),
      },
    }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found.",
      });
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();

    await subscription.save();

    // ------------------------------------------
    // SEND CANCELLATION EMAIL
    // ------------------------------------------

    try {
      const user = await User.findById(req.user.id).select("name email");

      if (user?.email) {
        await sendSubscriptionCancelledEmail(user, subscription, false);
      }
    } catch (emailError) {
      console.error("Subscription Cancellation Email Error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully.",
      subscription,
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================================
// ADMIN - GET ALL SUBSCRIPTIONS
// ======================================================

export const getAllSubscriptions = async (req, res) => {
  try {
    const now = new Date();

    // Auto-expire old active subscriptions
    await Subscription.updateMany(
      {
        status: "active",

        expiryDate: {
          $ne: null,
          $lte: now,
        },
      },

      {
        $set: {
          status: "expired",
        },
      },
    );

    const { status, plan } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (plan) {
      filter.plan = plan;
    }

    const subscriptions = await Subscription.find(filter)
      .populate("userId", "name email phone role")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Get All Subscription Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================================
// EXPIRE SUBSCRIPTIONS
// ======================================================

export const expireSubscriptions = async (req, res) => {
  try {
    const now = new Date();

    const result = await Subscription.updateMany(
      {
        status: "active",

        expiryDate: {
          $lte: now,
        },
      },

      {
        $set: {
          status: "expired",
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Expired subscriptions updated successfully.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Expire Subscription Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================================
// ADMIN - CANCEL SPECIFIC SUBSCRIPTION
// ======================================================

export const adminCancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    if (subscription.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active subscriptions can be cancelled.",
      });
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();

    await subscription.save();

    // ------------------------------------------
    // SEND ADMIN CANCELLATION EMAIL
    // ------------------------------------------

    try {
      const user = await User.findById(subscription.userId).select(
        "name email",
      );

      if (user?.email) {
        await sendSubscriptionCancelledEmail(user, subscription, true);
      }
    } catch (emailError) {
      console.error("Admin Subscription Cancellation Email Error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully.",
      subscription,
    });
  } catch (error) {
    console.error("Admin Cancel Subscription Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
