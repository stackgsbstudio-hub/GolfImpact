import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    matchCount: {
      type: Number,
      enum: [3, 4, 5],
      required: true,
    },

    matchedNumbers: [
      {
        type: Number,
        min: 1,
        max: 45,
      },
    ],

    prizeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    proofImage: {
      type: String,
      default: "",
      trim: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    payoutReference: {
      type: String,
      default: null,
      trim: true,
    },

    payoutNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

winnerSchema.index(
  {
    draw: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("Winner", winnerSchema);
