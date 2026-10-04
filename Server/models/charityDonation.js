import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    charity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Donation", donationSchema);
