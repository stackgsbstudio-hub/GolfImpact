import mongoose from "mongoose";
import Charity from "../models/Charity.js";
import User from "../models/User.js";
import sharp from "sharp";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

// =====================================================
// ADD CHARITY - ADMIN
// =====================================================

export const addCharity = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      images = [],
      category,
      location,
      website,
      featured = false,
      active = true,
      events = [],
    } = req.body;

    if (!name?.trim() || !description?.trim() || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, description and category are required.",
      });
    }

    const existingCharity = await Charity.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingCharity) {
      return res.status(409).json({
        success: false,
        message: "Charity already exists.",
      });
    }

    const charity = await Charity.create({
      name,
      description,
      image,
      images: Array.isArray(images)
        ? images.filter((item) => item?.trim())
        : [],
      category,
      location,
      website,
      featured: Boolean(featured),
      active: Boolean(active),
      events,
    });

    return res.status(201).json({
      success: true,
      message: "Charity added successfully.",
      charity,
    });
  } catch (error) {
    console.error("Add Charity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// GET ALL CHARITIES - PUBLIC
// Search + category + location + featured
// =====================================================

export const getCharities = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      location = "",
      featured = "",
    } = req.query;

    const filter = {
      active: true,
    };

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (category.trim()) {
      filter.category = {
        $regex: category.trim(),
        $options: "i",
      };
    }

    if (location.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const charities = await Charity.find(filter).sort({
      featured: -1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: charities.length,
      charities,
    });
  } catch (error) {
    console.error("Get Charities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// GET FEATURED CHARITY - PUBLIC
// =====================================================

export const getFeaturedCharity = async (req, res) => {
  try {
    const allCharities = await Charity.find({});

    const charities = await Charity.find({
      featured: true,
      active: true,
    })
      .sort({ updatedAt: -1 })
      .limit(2);

    return res.status(200).json({
      success: true,
      charities,
    });
  } catch (error) {
    console.error("GET FEATURED CHARITIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch featured charities.",
    });
  }
};

// =====================================================
// GET CHARITY BY ID - PUBLIC
// =====================================================

// =====================================================
// GET CHARITY BY ID - PUBLIC
// =====================================================

export const getCharityById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid charity ID.",
      });
    }

    const charity = await Charity.findOne({
      _id: req.params.id,
      active: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    const charityObject = charity.toObject();

    const today = new Date();

    charityObject.events = (charityObject.events || [])
      .filter((event) => {
        if (!event.date) return false;

        return new Date(event.date) >= today;
      })
      .sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

    return res.status(200).json({
      success: true,
      charity: charityObject,
    });
  } catch (error) {
    console.error("Get Charity By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// UPDATE CHARITY - ADMIN
// =====================================================

export const updateCharity = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid charity ID.",
      });
    }

    // Prevent accidental MongoDB internal field updates
    delete req.body._id;
    delete req.body.__v;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Charity updated successfully.",
      charity,
    });
  } catch (error) {
    console.error("Update Charity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// DELETE / DEACTIVATE CHARITY - ADMIN
// =====================================================

export const deleteCharity = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid charity ID.",
      });
    }

    /*
      Soft delete is safer because users may already
      have this charity selected.
    */

    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      {
        active: false,
        featured: false,
      },
      {
        new: true,
      },
    );

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Charity deactivated successfully.",
    });
  } catch (error) {
    console.error("Delete Charity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// SELECT / CHANGE CHARITY - ACTIVE SUBSCRIBER
// Minimum contribution = 10%
// =====================================================

export const selectCharity = async (req, res) => {
  try {
    const { charityId, contributionPercentage = 10 } = req.body;

    if (!charityId) {
      return res.status(400).json({
        success: false,
        message: "Please select a charity.",
      });
    }

    const percentage = Number(contributionPercentage);

    // PRD: minimum contribution = 10%
    if (!Number.isFinite(percentage) || percentage < 10 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Contribution percentage must be between 10 and 100.",
      });
    }

    const charity = await Charity.findOne({
      _id: charityId,
      active: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found or inactive.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        selectedCharity: charity._id,
        charityContributionPercentage: percentage,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-password")
      .populate("selectedCharity");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Charity selection updated successfully.",
      charity: {
        charity: user.selectedCharity,
        contributionPercentage: user.charityContributionPercentage,
      },
    });
  } catch (error) {
    console.error("Select Charity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// GET MY SELECTED CHARITY - ACTIVE SUBSCRIBER
// =====================================================

export const getMyCharity = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("selectedCharity charityContributionPercentage")
      .populate("selectedCharity");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,

      charity: user.selectedCharity
        ? {
            charity: user.selectedCharity,
            contributionPercentage: user.charityContributionPercentage ?? 10,
          }
        : null,
    });
  } catch (error) {
    console.error("Get My Charity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// ADMIN - GET ALL CHARITIES
// =====================================================

export const adminGetAllCharities = async (req, res) => {
  try {
    const charities = await Charity.find({}).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: charities.length,
      charities,
    });
  } catch (error) {
    console.error("Admin Get All Charities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// ADMIN - GET CHARITY BY ID
// =====================================================

export const adminGetCharityById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid charity ID.",
      });
    }

    const charity = await Charity.findById(req.params.id);

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    return res.status(200).json({
      success: true,
      charity,
    });
  } catch (error) {
    console.error("Admin Get Charity By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =====================================================
// ADMIN - UPLOAD CHARITY IMAGES
// =====================================================

export const uploadCharityImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image.",
      });
    }

    const images = [];

    for (const file of req.files) {
      // Optimize image before uploading to Cloudinary
      const optimizedBuffer = await sharp(file.buffer)
        .resize(1600, 900, {
          fit: "contain",
          position: "centre",
          background: {
            r: 9,
            g: 17,
            b: 27,
            alpha: 1,
          },
        })
        .webp({
          quality: 82,
        })
        .toBuffer();

      // Upload optimized image to Cloudinary
      const uploadResult = await uploadBufferToCloudinary(
        optimizedBuffer,
        "golfimpact/charities",
        {
          format: "webp",
        },
      );

      images.push(uploadResult.secure_url);
    }

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully.",
      images,
    });
  } catch (error) {
    console.error("Upload Charity Images Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process images.",
    });
  }
};
