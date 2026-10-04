import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

ScoreSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Score", ScoreSchema);
