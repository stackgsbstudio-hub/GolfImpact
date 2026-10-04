import mongoose from "mongoose";

const drawSchema = new mongoose.Schema(
  {
    drawMonth: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid draw month format."],
    },

    drawNumbers: {
      type: [
        {
          type: Number,
          min: 1,
          max: 45,
        },
      ],
      default: [],
      validate: {
        validator(numbers) {
          return (
            numbers.length === 0 ||
            (numbers.length === 5 && new Set(numbers).size === 5)
          );
        },
        message: "Draw must contain 5 unique numbers.",
      },
    },

    drawType: {
      type: String,
      enum: ["random", "algorithmic"],
      default: "random",
    },

    status: {
      type: String,
      enum: ["draft", "simulated", "published"],
      default: "draft",
    },

    prizePool: {
      type: Number,
      default: 0,
      min: 0,
    },

    prizeBreakdown: {
      fiveMatch: {
        type: Number,
        default: 0,
        min: 0,
      },

      fourMatch: {
        type: Number,
        default: 0,
        min: 0,
      },

      threeMatch: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    jackpotRollover: {
      type: Number,
      default: 0,
      min: 0,
    },

    rolloverIn: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    winnersCalculatedAt: {
      type: Date,
      default: null,
    },

    prizesDistributedAt: {
      type: Date,
      default: null,
    },

    prizeCalculation: {
      activeSubscribers: {
        type: Number,
        default: 0,
      },

      allocatedRevenue: {
        type: Number,
        default: 0,
      },

      charityContribution: {
        type: Number,
        default: 0,
      },

      prizePoolPercentage: {
        type: Number,
        default: 0,
      },

      calculatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Draw", drawSchema);
