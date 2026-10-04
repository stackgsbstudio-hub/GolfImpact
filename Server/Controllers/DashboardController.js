import User from "../models/User.js";
import Subscription from "../models/subscriptionModel.js";
import Score from "../models/Score.js";
import Draw from "../models/Draw.js";
import Winner from "../models/Winner.js";

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // 1. User + selected charity
    const user = await User.findById(userId)
      .select(
        "name email phone gender dateOfBirth profileImage isActive selectedCharity charityContributionPercentage",
      )
      .populate(
        "selectedCharity",
        "name description image category location website",
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await Subscription.updateMany(
      {
        userId,
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

    // 2. Current active subscription
    let subscription = await Subscription.findOne({
      userId,
      status: "active",
      expiryDate: { $gt: now },
    }).sort({ expiryDate: -1 });

    // Agar active nahi hai to latest subscription show karo
    if (!subscription) {
      subscription = await Subscription.findOne({
        userId,
      }).sort({ createdAt: -1 });
    }

    // 3. Latest 5 scores
    const scores = await Score.find({
      user: userId,
    })
      .sort({ date: -1 })
      .limit(5);

    // 4. Latest/upcoming published draw
    const latestDraw = await Draw.findOne({
      status: "published",
    }).sort({
      drawMonth: -1,
    });

    // 5. User winnings
    const winnings = await Winner.find({
      user: userId,
    })
      .populate("draw", "drawMonth drawNumbers status publishedAt")
      .sort({
        createdAt: -1,
      });

    // 6. Winning totals

    const totalWinnings = winnings.reduce(
      (total, winner) => total + (winner.prizeAmount || 0),
      0,
    );

    const paidWinnings = winnings.reduce((total, winner) => {
      if (winner.payoutStatus === "paid") {
        return total + (winner.prizeAmount || 0);
      }

      return total;
    }, 0);

    const pendingWinnings = winnings.reduce((total, winner) => {
      if (winner.payoutStatus === "pending") {
        return total + (winner.prizeAmount || 0);
      }

      return total;
    }, 0);

    const hasActiveSubscription =
      Boolean(subscription) &&
      subscription.status === "active" &&
      Boolean(subscription.expiryDate) &&
      subscription.expiryDate > now;

    const hasFiveScores = scores.length >= 5;

    const drawEligibility = {
      eligible: Boolean(latestDraw) && hasActiveSubscription && hasFiveScores,

      reason: !latestDraw
        ? "No published draw is currently available."
        : !hasActiveSubscription
          ? "An active subscription is required to participate."
          : !hasFiveScores
            ? `You need 5 scores to participate. You currently have ${scores.length}.`
            : "Your latest 5 scores are eligible for the draw.",
    };

    return res.status(200).json({
      success: true,

      dashboard: {
        profile: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          profileImage: user.profileImage || "",
          isActive: user.isActive,
        },

        subscription: subscription
          ? {
              id: subscription._id,
              plan: subscription.plan,
              amount: subscription.amount,
              status: subscription.status,
              startDate: subscription.startDate,
              expiryDate: subscription.expiryDate,
              hasActiveSubscription,
            }
          : null,

        charity: user.selectedCharity
          ? {
              charity: user.selectedCharity,
              contributionPercentage: user.charityContributionPercentage,
            }
          : null,

        scores: {
          count: scores.length,
          latestFive: scores,
        },

        draw: {
          latestDraw,
          eligibility: drawEligibility,
        },

        winnings: {
          totalAmount: totalWinnings,
          paidAmount: paidWinnings,
          pendingAmount: pendingWinnings,
          totalWins: winnings.length,
          history: winnings,
        },
      },
    });
  } catch (error) {
    console.error("User Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
