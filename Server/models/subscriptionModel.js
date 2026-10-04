import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["created", "active", "inactive", "cancelled", "expired"],
      default: "created",
    },

    OrderId: {
      type: String,
      default: null,
    },

    PaymentId: {
      type: String,
      default: null,
    },

    PaymentSignature: {
      type: String,
      default: null,
    },

    startDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Subscription", subscriptionSchema);
