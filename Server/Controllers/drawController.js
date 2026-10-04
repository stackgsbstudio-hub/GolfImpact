import Draw from "../models/Draw.js";
import Score from "../models/Score.js";
import Winner from "../models/Winner.js";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";

// =====================================================
// HELPERS
// =====================================================

const sendDrawPublishedEmail = async (user, draw) => {
  if (!user?.email) return;

  const drawNumbers = draw.drawNumbers?.join(", ") || "-";

  return await sendEmail({
    to: user.email,

    subject: `GolfImpact Draw Results - ${draw.drawMonth}`,

    text: `Hi ${user.name || "Golfer"}, the GolfImpact draw for ${
      draw.drawMonth
    } has been published. Draw numbers: ${drawNumbers}`,

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
            Draw Results Published
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
            The GolfImpact draw for
            <strong>${draw.drawMonth}</strong>
            has been published.
          </p>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:24px;
            margin:24px 0;
            text-align:center;
          ">

            <p style="
              color:#9CA3AF;
              margin-top:0;
            ">
              Draw Numbers
            </p>

            <div style="
              color:#ffffff;
              font-size:26px;
              font-weight:bold;
              letter-spacing:6px;
            ">
              ${drawNumbers}
            </div>

          </div>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:16px;
            margin-bottom:24px;
          ">

            <p style="margin:6px 0;">
              <strong>Draw Month:</strong>
              ${draw.drawMonth}
            </p>

            <p style="margin:6px 0;">
              <strong>Draw Type:</strong>
              ${draw.drawType}
            </p>

          </div>

          <p style="color:#D1D5DB;">
            Sign in to your GolfImpact dashboard to review your
            participation and draw details.
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
};

const sendWinnerAlertEmail = async (user, draw, winner) => {
  if (!user?.email) return;

  const matchedNumbers = winner.matchedNumbers?.join(", ") || "-";

  return await sendEmail({
    to: user.email,

    subject: `Congratulations! You Won in GolfImpact - ${draw.drawMonth}`,

    text: `Hi ${user.name || "Golfer"}, congratulations! You matched ${
      winner.matchCount
    } out of 5 numbers in the GolfImpact draw for ${
      draw.drawMonth
    }. Matched numbers: ${matchedNumbers}`,

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

          <h1 style="color:#9A8DFF;margin-top:0;">
            GolfImpact
          </h1>

          <h2 style="color:#ffffff;">
            Congratulations! 🎉
          </h2>

          <p style="color:#D1D5DB;font-size:16px;">
            Hi ${user.name || "Golfer"},
          </p>

          <p style="color:#D1D5DB;font-size:16px;">
            You're a winner in the
            <strong>${draw.drawMonth}</strong>
            GolfImpact draw.
          </p>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:24px;
            margin:24px 0;
            text-align:center;
          ">

            <p style="color:#9CA3AF;margin-top:0;">
              Your Match
            </p>

            <div style="
              color:#9A8DFF;
              font-size:32px;
              font-weight:bold;
            ">
              ${winner.matchCount}/5
            </div>

            <p style="color:#D1D5DB;margin-bottom:0;">
              Matched Numbers:
              <strong>${matchedNumbers}</strong>
            </p>

          </div>

          <p style="color:#D1D5DB;">
            Sign in to your GolfImpact dashboard to review your
            winnings and complete any required winner verification.
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
};

const generateRandomNumbers = () => {
  const numbers = new Set();

  while (numbers.size < 5) {
    const randomNumber = Math.floor(Math.random() * 45) + 1;
    numbers.add(randomNumber);
  }

  return [...numbers].sort((a, b) => a - b);
};

const getDrawMonthRange = (drawMonth) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(drawMonth)) {
    return null;
  }

  const [year, month] = drawMonth.split("-").map(Number);

  return {
    monthStart: new Date(Date.UTC(year, month - 1, 1)),
    monthEnd: new Date(Date.UTC(year, month, 1)),
  };
};

const getEligibleSubscriberIds = async (drawMonth) => {
  const range = getDrawMonthRange(drawMonth);

  if (!range) {
    return {
      userIds: [],
      monthStart: null,
      monthEnd: null,
    };
  }

  const { monthStart, monthEnd } = range;

  const activeSubscriptions = await Subscription.find({
    status: "active",
    startDate: { $lt: monthEnd },
    expiryDate: { $gt: monthStart },
  }).select("userId");

  const userIds = [
    ...new Set(
      activeSubscriptions
        .filter((subscription) => subscription.userId)
        .map((subscription) => subscription.userId.toString()),
    ),
  ];

  return {
    userIds,
    monthStart,
    monthEnd,
  };
};

const weightedPick = (items, selectedNumbers) => {
  const available = items.filter((item) => !selectedNumbers.has(item.number));

  if (available.length === 0) {
    return null;
  }

  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);

  let random = Math.random() * totalWeight;

  for (const item of available) {
    random -= item.weight;

    if (random <= 0) {
      return item.number;
    }
  }

  return available[available.length - 1].number;
};

const generateAlgorithmicNumbers = async (drawMonth) => {
  const range = getDrawMonthRange(drawMonth);

  if (!range) {
    return generateRandomNumbers();
  }

  const { monthEnd } = range;

  const { userIds } = await getEligibleSubscriberIds(drawMonth);

  if (userIds.length === 0) {
    return generateRandomNumbers();
  }

  const allScores = [];

  for (const userId of userIds) {
    const scores = await Score.find({
      user: userId,
      date: {
        $lt: monthEnd,
      },
    })
      .sort({
        date: -1,
      })
      .limit(5);

    // Only users with full 5 scores participate
    if (scores.length < 5) {
      continue;
    }

    for (const item of scores) {
      allScores.push(item.score);
    }
  }

  // No usable score data → fallback to random
  if (allScores.length === 0) {
    return generateRandomNumbers();
  }

  // Build frequency table from 1 to 45
  const frequency = {};

  for (let number = 1; number <= 45; number++) {
    frequency[number] = 0;
  }

  for (const score of allScores) {
    frequency[score] = (frequency[score] || 0) + 1;
  }

  const maxFrequency = Math.max(...Object.values(frequency));

  // Most frequent scores get higher weight
  const frequentWeights = [];

  // Least frequent scores get higher weight
  const leastFrequentWeights = [];

  for (let number = 1; number <= 45; number++) {
    const count = frequency[number];

    frequentWeights.push({
      number,
      weight: count + 1,
    });

    leastFrequentWeights.push({
      number,
      weight: maxFrequency - count + 1,
    });
  }

  const selected = new Set();

  // Pick 3 numbers weighted toward most frequent scores
  while (selected.size < 3) {
    const pickedNumber = weightedPick(frequentWeights, selected);

    if (pickedNumber === null) {
      break;
    }

    selected.add(pickedNumber);
  }

  // Pick remaining 2 weighted toward least frequent scores
  while (selected.size < 5) {
    const pickedNumber = weightedPick(leastFrequentWeights, selected);

    if (pickedNumber === null) {
      break;
    }

    selected.add(pickedNumber);
  }

  // Safety fallback
  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1);
  }

  return [...selected].sort((a, b) => a - b);
};

// =====================================================
// CREATE DRAW
// =====================================================

export const createRandomDraw = async (req, res) => {
  try {
    const { drawMonth, drawType = "random" } = req.body;

    if (!drawMonth) {
      return res.status(400).json({
        success: false,
        message: "Draw month is required.",
      });
    }

    if (!["random", "algorithmic"].includes(drawType)) {
      return res.status(400).json({
        success: false,
        message: "Draw type must be random or algorithmic.",
      });
    }

    const range = getDrawMonthRange(drawMonth);

    if (!range) {
      return res.status(400).json({
        success: false,
        message: "drawMonth must be in YYYY-MM format.",
      });
    }

    const existingDraw = await Draw.findOne({
      drawMonth,
    });

    if (existingDraw) {
      return res.status(409).json({
        success: false,
        message: "Draw already exists for this month.",
      });
    }

    const previousDraw = await Draw.findOne({
      drawMonth: {
        $lt: drawMonth,
      },
      status: "published",
    }).sort({
      drawMonth: -1,
    });

    const rolloverIn = previousDraw?.jackpotRollover || 0;

    let drawNumbers = [];

    if (drawType === "algorithmic") {
      drawNumbers = await generateAlgorithmicNumbers(drawMonth);
    } else {
      drawNumbers = generateRandomNumbers();
    }

    const draw = await Draw.create({
      drawMonth,
      drawNumbers,
      drawType,
      status: "draft",
      rolloverIn,
    });

    return res.status(201).json({
      success: true,
      message:
        drawType === "algorithmic"
          ? "Algorithmic draw created successfully."
          : "Random draw created successfully.",
      draw,
    });
  } catch (error) {
    console.error("Create Draw Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Draw already exists for this month.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// CALCULATE PRIZE POOL
// =====================================================

export const calculatePrizePool = async (req, res) => {
  try {
    const { drawId } = req.params;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Prize pool cannot be recalculated after publishing.",
      });
    }

    const range = getDrawMonthRange(draw.drawMonth);

    if (!range) {
      return res.status(400).json({
        success: false,
        message: "Invalid draw month.",
      });
    }

    const { monthStart, monthEnd } = range;

    const previousDraw = await Draw.findOne({
      drawMonth: {
        $lt: draw.drawMonth,
      },
      status: "published",
    }).sort({
      drawMonth: -1,
    });

    const rolloverIn = previousDraw?.jackpotRollover || 0;

    const subscriptions = await Subscription.find({
      status: "active",
      startDate: {
        $lt: monthEnd,
      },
      expiryDate: {
        $gt: monthStart,
      },
    }).populate(
      "userId",
      "name email charityContributionPercentage selectedCharity",
    );

    const PRIZE_POOL_PERCENTAGE =
      Number(process.env.PRIZE_POOL_PERCENTAGE) || 50;

    let totalAllocatedRevenue = 0;
    let totalCharityContribution = 0;
    let prizePool = 0;

    const breakdown = [];

    for (const subscription of subscriptions) {
      if (!subscription.userId) {
        continue;
      }

      let allocatedAmount = Number(subscription.amount) || 0;

      if (subscription.plan === "yearly") {
        allocatedAmount = allocatedAmount / 12;
      }

      const charityPercentage =
        subscription.userId.charityContributionPercentage || 10;

      const charityContribution = (allocatedAmount * charityPercentage) / 100;

      const prizeContribution = (allocatedAmount * PRIZE_POOL_PERCENTAGE) / 100;

      totalAllocatedRevenue += allocatedAmount;

      totalCharityContribution += charityContribution;

      prizePool += prizeContribution;

      breakdown.push({
        user: subscription.userId._id,
        name: subscription.userId.name,
        plan: subscription.plan,
        paidSubscriptionAmount: subscription.amount,
        allocatedAmount,
        charityPercentage,
        charityContribution,
        prizePoolPercentage: PRIZE_POOL_PERCENTAGE,
        prizeContribution,
      });
    }

    const fiveMatchPool = prizePool * 0.4 + rolloverIn;

    const fourMatchPool = prizePool * 0.35;

    const threeMatchPool = prizePool * 0.25;

    draw.rolloverIn = rolloverIn;
    draw.prizePool = prizePool;

    draw.prizeBreakdown = {
      fiveMatch: fiveMatchPool,
      fourMatch: fourMatchPool,
      threeMatch: threeMatchPool,
    };

    draw.prizeCalculation = {
      activeSubscribers: subscriptions.filter(
        (subscription) => subscription.userId,
      ).length,

      allocatedRevenue: totalAllocatedRevenue,

      charityContribution: totalCharityContribution,

      prizePoolPercentage: PRIZE_POOL_PERCENTAGE,

      calculatedAt: new Date(),
    };

    await draw.save();

    return res.status(200).json({
      success: true,
      message: "Prize pool calculated successfully.",

      activeSubscribers: draw.prizeCalculation.activeSubscribers,

      totalAllocatedRevenue,
      totalCharityContribution,

      prizePool,
      prizePoolPercentage: PRIZE_POOL_PERCENTAGE,

      rolloverIn,

      prizeBreakdown: draw.prizeBreakdown,

      breakdown,
    });
  } catch (error) {
    console.error("Calculate Prize Pool Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// SIMULATE DRAW
// =====================================================

export const simulateDraw = async (req, res) => {
  try {
    const { drawId } = req.params;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Published draw cannot be simulated.",
      });
    }

    if (!draw.drawNumbers || draw.drawNumbers.length !== 5) {
      return res.status(400).json({
        success: false,
        message: "Draw must contain 5 numbers.",
      });
    }

    const { userIds, monthEnd } = await getEligibleSubscriberIds(
      draw.drawMonth,
    );

    const simulatedWinners = [];

    for (const userId of userIds) {
      const scores = await Score.find({
        user: userId,
        date: {
          $lt: monthEnd,
        },
      })
        .sort({
          date: -1,
        })
        .limit(5);

      if (scores.length < 5) {
        continue;
      }

      const userScores = scores.map((item) => item.score);

      const matchedNumbers = [
        ...new Set(
          userScores.filter((score) => draw.drawNumbers.includes(score)),
        ),
      ];

      const matchCount = matchedNumbers.length;

      if (matchCount >= 3) {
        simulatedWinners.push({
          user: userId,
          userScores,
          matchCount,
          matchedNumbers,
        });
      }
    }

    const summary = {
      fiveMatch: simulatedWinners.filter((winner) => winner.matchCount === 5)
        .length,

      fourMatch: simulatedWinners.filter((winner) => winner.matchCount === 4)
        .length,

      threeMatch: simulatedWinners.filter((winner) => winner.matchCount === 3)
        .length,
    };

    draw.status = "simulated";

    await draw.save();

    return res.status(200).json({
      success: true,
      message: "Draw simulation completed.",

      draw: {
        id: draw._id,
        drawMonth: draw.drawMonth,
        drawNumbers: draw.drawNumbers,
        drawType: draw.drawType,
        status: draw.status,
      },

      totalEligibleSubscribers: userIds.length,

      totalPossibleWinners: simulatedWinners.length,

      summary,
      simulatedWinners,
    });
  } catch (error) {
    console.error("Simulate Draw Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// PUBLISH DRAW
// =====================================================

export const publishDraw = async (req, res) => {
  try {
    const { drawId } = req.params;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Draw is already published.",
      });
    }

    if (draw.status !== "simulated") {
      return res.status(400).json({
        success: false,
        message: "Draw must be simulated before publishing.",
      });
    }

    if (!draw.drawNumbers || draw.drawNumbers.length !== 5) {
      return res.status(400).json({
        success: false,
        message: "Draw must contain 5 numbers.",
      });
    }

    if (!draw.prizeCalculation?.calculatedAt) {
      return res.status(400).json({
        success: false,
        message: "Prize pool must be calculated before publishing.",
      });
    }

    // ============================================
    // PUBLISH DRAW
    // ============================================

    draw.status = "published";
    draw.publishedAt = new Date();

    await draw.save();

    // ============================================
    // SEND DRAW RESULT EMAILS
    // ============================================

    try {
      const { userIds, monthEnd } = await getEligibleSubscriberIds(
        draw.drawMonth,
      );

      const eligibleParticipantIds = [];

      // Email only users who actually participated:
      // active subscription + minimum 5 scores
      for (const userId of userIds) {
        const scoreCount = await Score.countDocuments({
          user: userId,
          date: {
            $lt: monthEnd,
          },
        });

        if (scoreCount >= 5) {
          eligibleParticipantIds.push(userId);
        }
      }

      const users = await User.find({
        _id: {
          $in: eligibleParticipantIds,
        },
        isActive: true,
      }).select("name email");

      const emailResults = await Promise.allSettled(
        users.map((user) => sendDrawPublishedEmail(user, draw)),
      );

      const sentCount = emailResults.filter(
        (result) => result.status === "fulfilled",
      ).length;

      const failedCount = emailResults.filter(
        (result) => result.status === "rejected",
      ).length;

      console.log(
        `Draw ${draw.drawMonth} emails: ${sentCount} sent, ${failedCount} failed.`,
      );

      emailResults.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Draw Published Email Error:", result.reason);
        }
      });
    } catch (emailError) {
      // Published draw must remain published even if email fails
      console.error("Draw Published Email Process Error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Draw published successfully.",
      draw,
    });
  } catch (error) {
    console.error("Publish Draw Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// OFFICIAL WINNER CALCULATION
// =====================================================

export const calculateWinners = async (req, res) => {
  try {
    const { drawId } = req.params;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Only published draws can calculate official winners.",
      });
    }

    if (!draw.drawNumbers || draw.drawNumbers.length !== 5) {
      return res.status(400).json({
        success: false,
        message: "Draw must contain 5 numbers.",
      });
    }

    if (draw.prizesDistributedAt) {
      return res.status(400).json({
        success: false,
        message: "Winners cannot be recalculated after prize distribution.",
      });
    }

    const { userIds, monthEnd } = await getEligibleSubscriberIds(
      draw.drawMonth,
    );

    await Winner.deleteMany({
      draw: draw._id,
    });

    const winners = [];

    for (const userId of userIds) {
      const scores = await Score.find({
        user: userId,
        date: {
          $lt: monthEnd,
        },
      })
        .sort({
          date: -1,
        })
        .limit(5);

      if (scores.length < 5) {
        continue;
      }

      const userScores = scores.map((item) => item.score);

      const matchedNumbers = [
        ...new Set(
          userScores.filter((score) => draw.drawNumbers.includes(score)),
        ),
      ];

      const matchCount = matchedNumbers.length;

      if (matchCount >= 3) {
        const winner = await Winner.create({
          draw: draw._id,
          user: userId,
          matchCount,
          matchedNumbers,
        });

        winners.push(winner);

        // Winner alert email
        try {
          const user = await User.findById(userId).select("name email");

          if (user?.email) {
            const emailResult = await sendWinnerAlertEmail(user, draw, winner);

            if (emailResult?.success === false) {
              console.error(
                `Winner Alert Email Failed for ${user.email}:`,
                emailResult.error,
              );
            }
          }
        } catch (emailError) {
          // Winner calculation must not fail if email fails
          console.error("Winner Alert Email Error:", emailError);
        }
      }
    }

    draw.winnersCalculatedAt = new Date();

    await draw.save();

    return res.status(200).json({
      success: true,
      message: "Winner calculation completed.",

      totalEligibleSubscribers: userIds.length,

      totalWinners: winners.length,

      winners,
    });
  } catch (error) {
    console.error("Calculate Winners Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// DISTRIBUTE PRIZES
// =====================================================

export const distributePrizes = async (req, res) => {
  try {
    const { drawId } = req.params;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Only published draws can distribute prizes.",
      });
    }

    if (!draw.winnersCalculatedAt) {
      return res.status(400).json({
        success: false,
        message: "Calculate winners before distributing prizes.",
      });
    }

    if (draw.prizesDistributedAt) {
      return res.status(400).json({
        success: false,
        message: "Prizes have already been distributed.",
      });
    }

    if (!draw.prizePool || draw.prizePool <= 0) {
      return res.status(400).json({
        success: false,
        message: "Prize pool must be greater than 0.",
      });
    }

    const winners = await Winner.find({
      draw: drawId,
    });

    const fiveMatchWinners = winners.filter(
      (winner) => winner.matchCount === 5,
    );

    const fourMatchWinners = winners.filter(
      (winner) => winner.matchCount === 4,
    );

    const threeMatchWinners = winners.filter(
      (winner) => winner.matchCount === 3,
    );

    const baseFiveMatchPool = draw.prizePool * 0.4;

    const fiveMatchPool = baseFiveMatchPool + (draw.rolloverIn || 0);

    const fourMatchPool = draw.prizePool * 0.35;

    const threeMatchPool = draw.prizePool * 0.25;

    if (fiveMatchWinners.length > 0) {
      const amountPerWinner = fiveMatchPool / fiveMatchWinners.length;

      await Winner.updateMany(
        {
          draw: drawId,
          matchCount: 5,
        },
        {
          $set: {
            prizeAmount: amountPerWinner,
          },
        },
      );

      draw.jackpotRollover = 0;
    } else {
      draw.jackpotRollover = fiveMatchPool;
    }

    if (fourMatchWinners.length > 0) {
      const amountPerWinner = fourMatchPool / fourMatchWinners.length;

      await Winner.updateMany(
        {
          draw: drawId,
          matchCount: 4,
        },
        {
          $set: {
            prizeAmount: amountPerWinner,
          },
        },
      );
    }

    if (threeMatchWinners.length > 0) {
      const amountPerWinner = threeMatchPool / threeMatchWinners.length;

      await Winner.updateMany(
        {
          draw: drawId,
          matchCount: 3,
        },
        {
          $set: {
            prizeAmount: amountPerWinner,
          },
        },
      );
    }

    draw.prizeBreakdown = {
      fiveMatch: fiveMatchPool,
      fourMatch: fourMatchPool,
      threeMatch: threeMatchPool,
    };

    draw.prizesDistributedAt = new Date();

    await draw.save();

    const updatedWinners = await Winner.find({
      draw: drawId,
    }).populate("user", "name email");

    return res.status(200).json({
      success: true,
      message: "Prizes distributed successfully.",

      prizePool: draw.prizePool,

      rolloverIn: draw.rolloverIn,

      prizeBreakdown: draw.prizeBreakdown,

      jackpotRollover: draw.jackpotRollover,

      winnerCounts: {
        fiveMatch: fiveMatchWinners.length,

        fourMatch: fourMatchWinners.length,

        threeMatch: threeMatchWinners.length,
      },

      winners: updatedWinners,
    });
  } catch (error) {
    console.error("Prize Distribution Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// GET ALL DRAWS - ADMIN
// =====================================================

export const getDraws = async (req, res) => {
  try {
    const draws = await Draw.find({}).sort({
      drawMonth: -1,
    });

    return res.status(200).json({
      success: true,
      draws,
    });
  } catch (error) {
    console.error("Get Draws Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const getMyParticipationSummary = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // =====================================================
    // CURRENT MONTH
    // =====================================================

    const currentDate = new Date();

    const currentMonth = `${currentDate.getUTCFullYear()}-${String(
      currentDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

    // =====================================================
    // ALL PUBLISHED DRAWS
    // =====================================================

    const publishedDraws = await Draw.find({
      status: "published",
    })
      .sort({
        drawMonth: -1,
      })
      .select(
        "drawMonth drawNumbers drawType status publishedAt prizeBreakdown jackpotRollover prizePool",
      );

    const allDraws = [];
    const participation = [];

    for (const draw of publishedDraws) {
      const range = getDrawMonthRange(draw.drawMonth);

      if (!range) {
        continue;
      }

      const { monthStart, monthEnd } = range;

      // -------------------------------------------------
      // Check subscription during this draw month
      // -------------------------------------------------

      const subscription = await Subscription.findOne({
        userId,
        status: {
          $in: ["active", "expired", "cancelled"],
        },
        startDate: {
          $lt: monthEnd,
        },
        expiryDate: {
          $gt: monthStart,
        },
      });

      // -------------------------------------------------
      // Get user's 5 scores for this draw
      // -------------------------------------------------

      const scores = await Score.find({
        user: userId,
        date: {
          $lt: monthEnd,
        },
      })
        .sort({
          date: -1,
        })
        .limit(5);

      const userScores = scores.map((item) => item.score);

      const participated = Boolean(subscription) && scores.length === 5;

      // -------------------------------------------------
      // Calculate matches only if user participated
      // -------------------------------------------------

      let matchedNumbers = [];
      let matchCount = 0;

      if (participated) {
        matchedNumbers = [
          ...new Set(
            userScores.filter((score) => draw.drawNumbers.includes(score)),
          ),
        ];

        matchCount = matchedNumbers.length;
      }

      // -------------------------------------------------
      // Check winner record
      // -------------------------------------------------

      const winner = participated
        ? await Winner.findOne({
            draw: draw._id,
            user: userId,
          }).select(
            "matchCount matchedNumbers prizeAmount verificationStatus payoutStatus",
          )
        : null;

      const drawData = {
        drawId: draw._id,

        drawMonth: draw.drawMonth,

        drawType: draw.drawType,

        status: draw.status,

        publishedAt: draw.publishedAt,

        drawNumbers: draw.drawNumbers,

        participated,

        subscriptionValid: Boolean(subscription),

        scoreCount: scores.length,

        userScores: participated ? userScores : [],

        matchedNumbers,

        matchCount,

        isWinner: matchCount >= 3,

        prizeAmount: winner?.prizeAmount || 0,

        verificationStatus: winner?.verificationStatus || null,

        payoutStatus: winner?.payoutStatus || null,
      };

      // Every published draw goes here
      allDraws.push(drawData);

      // Only draws user actually participated in
      if (participated) {
        participation.push(drawData);
      }
    }

    // =====================================================
    // CURRENT / UPCOMING UNPUBLISHED DRAW
    // =====================================================

    const upcomingDraw = await Draw.findOne({
      drawMonth: {
        $gte: currentMonth,
      },

      status: {
        $in: ["draft", "simulated"],
      },
    })
      .sort({
        drawMonth: 1,
      })
      .select("drawMonth drawType status");

    let upcomingParticipation = null;

    if (upcomingDraw) {
      const range = getDrawMonthRange(upcomingDraw.drawMonth);

      if (range) {
        const subscription = await Subscription.findOne({
          userId,

          status: "active",

          startDate: {
            $lt: range.monthEnd,
          },

          expiryDate: {
            $gt: range.monthStart,
          },
        });

        const scores = await Score.find({
          user: userId,

          date: {
            $lt: range.monthEnd,
          },
        })
          .sort({
            date: -1,
          })
          .limit(5);

        upcomingParticipation = {
          drawId: upcomingDraw._id,

          drawMonth: upcomingDraw.drawMonth,

          drawType: upcomingDraw.drawType,

          status: upcomingDraw.status,

          eligible: Boolean(subscription) && scores.length === 5,

          subscriptionActive: Boolean(subscription),

          scoreCount: scores.length,

          scoresRequired: 5,

          userScores: scores.map((item) => item.score),
        };
      }
    }

    // =====================================================
    // LATEST PUBLISHED DRAW
    // Only current month or previous month.
    // Future published draw must NOT become "latest".
    // =====================================================

    const latestPublishedDraw =
      allDraws.find((item) => item.drawMonth <= currentMonth) || null;

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      currentMonth,

      summary: {
        totalPublishedDraws: allDraws.length,

        totalDrawsEntered: participation.length,

        lastDraw:
          participation.length > 0
            ? participation.find((item) => item.drawMonth <= currentMonth)
                ?.drawMonth || null
            : null,

        upcomingDraw: upcomingParticipation?.drawMonth || null,
      },

      latestPublishedDraw,

      upcomingParticipation,

      // ALL published draws
      allDraws,

      // ALL draws in which this user participated
      recentParticipation: participation,
    });
  } catch (error) {
    console.error("Get Participation Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load participation summary.",
    });
  }
};
