import mongoose from "mongoose";
import Winner from "../models/Winner.js";
import { sendEmail } from "../utils/emailService.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

// =====================================================
// USER - GET MY WINNINGS
// =====================================================

// =====================================================
// EMAIL HELPERS
// =====================================================

const sendProofVerificationEmail = async (user, winner, draw) => {
  if (!user?.email) return;

  const approved = winner.verificationStatus === "approved";

  return await sendEmail({
    to: user.email,

    subject: approved
      ? `GolfImpact Winner Proof Approved - ${draw?.drawMonth || "Draw"}`
      : `GolfImpact Winner Proof Rejected - ${draw?.drawMonth || "Draw"}`,

    text: approved
      ? `Hi ${user.name || "Golfer"}, your winner proof for ${
          draw?.drawMonth || "the draw"
        } has been approved.`
      : `Hi ${user.name || "Golfer"}, your winner proof for ${
          draw?.drawMonth || "the draw"
        } has been rejected. Please sign in to your dashboard to review and upload a new proof if required.`,

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

          <h2 style="color:${approved ? "#22C55E" : "#EF4444"};">
            Winner Proof ${approved ? "Approved" : "Rejected"}
          </h2>

          <p style="color:#D1D5DB;font-size:16px;">
            Hi ${user.name || "Golfer"},
          </p>

          <p style="color:#D1D5DB;font-size:16px;">
            Your winner proof for
            <strong>${draw?.drawMonth || "the draw"}</strong>
            has been
            <strong>${approved ? "approved" : "rejected"}</strong>.
          </p>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:20px;
            margin:24px 0;
          ">
            <p style="margin:6px 0;">
              <strong>Match:</strong>
              ${winner.matchCount}/5
            </p>

            <p style="margin:6px 0;">
              <strong>Prize:</strong>
              ₹${winner.prizeAmount || 0}
            </p>

            <p style="margin:6px 0;">
              <strong>Verification:</strong>
              ${approved ? "Approved" : "Rejected"}
            </p>
          </div>

          <p style="color:#D1D5DB;">
            ${
              approved
                ? "Your proof has been verified successfully. Your payout can now be processed."
                : "Please sign in to your GolfImpact dashboard to review your winner details and upload a new proof if required."
            }
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

const sendPayoutPaidEmail = async (user, winner, draw) => {
  if (!user?.email) return;

  return await sendEmail({
    to: user.email,

    subject: `GolfImpact Prize Payment Completed - ${
      draw?.drawMonth || "Draw"
    }`,

    text: `Hi ${user.name || "Golfer"}, your GolfImpact prize payment of ₹${
      winner.prizeAmount || 0
    } for ${
      draw?.drawMonth || "the draw"
    } has been marked as paid. Payment reference: ${
      winner.payoutReference || "-"
    }`,

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

          <h2 style="color:#22C55E;">
            Prize Payment Completed
          </h2>

          <p style="color:#D1D5DB;font-size:16px;">
            Hi ${user.name || "Golfer"},
          </p>

          <p style="color:#D1D5DB;font-size:16px;">
            Your prize payment for
            <strong>${draw?.drawMonth || "the draw"}</strong>
            has been completed.
          </p>

          <div style="
            background:#09111B;
            border-radius:12px;
            padding:20px;
            margin:24px 0;
          ">

            <p style="margin:6px 0;">
              <strong>Prize Amount:</strong>
              ₹${winner.prizeAmount || 0}
            </p>

            <p style="margin:6px 0;">
              <strong>Payment Status:</strong>
              Paid
            </p>

            <p style="margin:6px 0;">
              <strong>Payment Reference:</strong>
              ${winner.payoutReference || "-"}
            </p>

          </div>

          <p style="color:#D1D5DB;">
            You can sign in to your GolfImpact dashboard to review
            your payment status.
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

export const getMyWinnings = async (req, res) => {
  try {
    const winners = await Winner.find({
      user: req.user.id,
    })
      .populate("draw", "drawMonth drawNumbers status publishedAt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: winners.length,
      winners,
    });
  } catch (error) {
    console.error("Get My Winnings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// ADMIN - GET ALL WINNERS
// =====================================================

export const getAllWinners = async (req, res) => {
  try {
    const { verificationStatus, payoutStatus, matchCount } = req.query;

    const filter = {};

    if (
      verificationStatus &&
      ["pending", "approved", "rejected"].includes(verificationStatus)
    ) {
      filter.verificationStatus = verificationStatus;
    }

    if (payoutStatus && ["pending", "paid"].includes(payoutStatus)) {
      filter.payoutStatus = payoutStatus;
    }

    if (matchCount && [3, 4, 5].includes(Number(matchCount))) {
      filter.matchCount = Number(matchCount);
    }

    const winners = await Winner.find(filter)
      .populate("user", "name email profileImage")
      .populate("draw", "drawMonth drawNumbers status")
      .populate("verifiedBy", "name email")
      .populate("paidBy", "name email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: winners.length,
      winners,
    });
  } catch (error) {
    console.error("Get All Winners Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// USER - UPLOAD WINNER PROOF
// =====================================================

export const uploadWinnerProof = async (req, res) => {
  try {
    const { winnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(winnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid winner ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Proof image is required.",
      });
    }

    const winner = await Winner.findOne({
      _id: winnerId,
      user: req.user.id,
    });

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found.",
      });
    }

    if (winner.payoutStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Proof cannot be changed after payout has been completed.",
      });
    }

    if (winner.verificationStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Approved proof cannot be replaced.",
      });
    }

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "golfimpact/winner-proofs",
    );

    winner.proofImage = uploadResult.secure_url;

    winner.verificationStatus = "pending";

    // Reset old rejection/verification info
    winner.verifiedBy = null;
    winner.verifiedAt = null;

    await winner.save();

    return res.status(200).json({
      success: true,
      message: "Winner proof uploaded successfully.",
      winner,
    });
  } catch (error) {
    console.error("Upload Winner Proof Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// ADMIN - VERIFY WINNER PROOF
// =====================================================

export const verifyWinnerProof = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(winnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid winner ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const winner = await Winner.findById(winnerId);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner not found.",
      });
    }

    if (!winner.proofImage) {
      return res.status(400).json({
        success: false,
        message: "Winner has not uploaded proof yet.",
      });
    }

    if (winner.payoutStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Verification cannot be changed after payout.",
      });
    }

    winner.verificationStatus = status;
    winner.verifiedBy = req.user.id;
    winner.verifiedAt = new Date();

    await winner.save();

    await winner.populate([
      {
        path: "verifiedBy",
        select: "name email",
      },
      {
        path: "user",
        select: "name email",
      },
      {
        path: "draw",
        select: "drawMonth drawNumbers",
      },
    ]);

    // Proof approved/rejected email
    try {
      if (winner.user?.email) {
        const emailResult = await sendProofVerificationEmail(
          winner.user,
          winner,
          winner.draw,
        );

        if (emailResult?.success === false) {
          console.error("Proof Verification Email Failed:", emailResult.error);
        }
      }
    } catch (emailError) {
      // Verification should remain successful even if email fails
      console.error("Proof Verification Email Error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: `Winner proof ${status} successfully.`,
      winner,
    });
  } catch (error) {
    console.error("Verify Winner Proof Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// ADMIN - MARK WINNER AS PAID
// =====================================================

export const markWinnerPaid = async (req, res) => {
  try {
    const { winnerId } = req.params;

    const { payoutReference, payoutNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(winnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid winner ID.",
      });
    }

    const winner = await Winner.findById(winnerId);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner not found.",
      });
    }

    if (winner.verificationStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Winner proof must be approved before payout.",
      });
    }

    if (winner.payoutStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Winner is already marked as paid.",
      });
    }

    if (!winner.prizeAmount || winner.prizeAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Winner does not have a valid prize amount.",
      });
    }

    if (!payoutReference || !payoutReference.trim()) {
      return res.status(400).json({
        success: false,
        message: "Payout reference is required.",
      });
    }

    winner.payoutStatus = "paid";
    winner.paidBy = req.user.id;
    winner.paidAt = new Date();

    winner.payoutReference = payoutReference.trim();

    winner.payoutNote = payoutNote?.trim() || "";

    await winner.save();

    await winner.populate([
      {
        path: "paidBy",
        select: "name email",
      },
      {
        path: "user",
        select: "name email",
      },
      {
        path: "draw",
        select: "drawMonth drawNumbers",
      },
    ]);

    // Payout completed email
    try {
      if (winner.user?.email) {
        const emailResult = await sendPayoutPaidEmail(
          winner.user,
          winner,
          winner.draw,
        );

        if (emailResult?.success === false) {
          console.error("Payout Paid Email Failed:", emailResult.error);
        }
      }
    } catch (emailError) {
      // Payout must remain paid even if email fails
      console.error("Payout Paid Email Error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Winner payout marked as paid successfully.",
      winner,
    });
  } catch (error) {
    console.error("Mark Winner Paid Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
