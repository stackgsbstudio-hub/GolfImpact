import mongoose from "mongoose";

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    website: {
      type: String,
      default: "",
      trim: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    events: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          default: "",
          trim: true,
        },

        date: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Charity", charitySchema);
