import Subscription from "../models/subscriptionModel.js";

const activeSubscriptionOnly = async (req, res, next) => {
  try {
    const now = new Date();

    // ==========================================
    // MARK EXPIRED SUBSCRIPTIONS
    // ==========================================

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

    // ==========================================
    // CHECK CURRENT ACTIVE SUBSCRIPTION
    // ==========================================

    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: "active",

      startDate: {
        $lte: now,
      },

      expiryDate: {
        $gt: now,
      },
    }).sort({
      expiryDate: -1,
    });

    // ==========================================
    // BLOCK NON-SUBSCRIBERS
    // ==========================================

    if (!subscription) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "An active subscription is required to access this feature.",
      });
    }

    // Make subscription available to controller
    req.subscription = subscription;

    next();
  } catch (error) {
    console.error("Active Subscription Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify subscription status.",
    });
  }
};

export default activeSubscriptionOnly;
