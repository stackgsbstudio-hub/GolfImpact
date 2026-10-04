import Subscription from "../models/subscriptionModel.js";

const requireActiveSubscription = async (req, res, next) => {
  try {
    const now = new Date();

    // Expired active subscriptions ko immediately update karo
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

    // Current valid subscription check
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

    if (!subscription) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "An active subscription is required to access this feature.",
      });
    }

    req.subscription = subscription;

    next();
  } catch (error) {
    console.error("Subscription Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify subscription status.",
    });
  }
};

export default requireActiveSubscription;
