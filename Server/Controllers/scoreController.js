import Score from "../models/Score.js";

// Normalize date to UTC midnight
const normalizeDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
    ),
  );
};

// Validate Stableford score
const isValidScore = (score) => {
  const numericScore = Number(score);

  return (
    Number.isInteger(numericScore) && numericScore >= 1 && numericScore <= 45
  );
};

// =============================
// ADD SCORE
// =============================
export const addScore = async (req, res) => {
  try {
    const { score, date } = req.body;

    if (score === undefined || score === null || !date) {
      return res.status(400).json({
        success: false,
        message: "Score and date are required",
      });
    }

    if (!isValidScore(score)) {
      return res.status(400).json({
        success: false,
        message: "Score must be a whole number between 1 and 45",
      });
    }

    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // Check duplicate date
    const existingScore = await Score.findOne({
      user: req.user.id,
      date: normalizedDate,
    });

    if (existingScore) {
      return res.status(400).json({
        success: false,
        message: "Score already exists for this date",
      });
    }

    // Create score
    const newScore = await Score.create({
      user: req.user.id,
      score: Number(score),
      date: normalizedDate,
    });

    // Get all scores newest first
    const scores = await Score.find({
      user: req.user.id,
    }).sort({ date: -1 });

    // Keep only latest 5
    if (scores.length > 5) {
      const oldScores = scores.slice(5);

      await Score.deleteMany({
        _id: {
          $in: oldScores.map((item) => item._id),
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Score added successfully",
      score: newScore,
    });
  } catch (error) {
    console.error("ADD SCORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// GET LATEST 5 SCORES
// =============================
export const getScores = async (req, res) => {
  try {
    const scores = await Score.find({
      user: req.user.id,
    })
      .sort({ date: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      count: scores.length,
      scores,
    });
  } catch (error) {
    console.error("GET SCORES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// UPDATE SCORE
// =============================
export const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, date } = req.body;

    // Find score belonging to logged-in user
    const existingScore = await Score.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    // Update score if provided
    if (score !== undefined) {
      if (!isValidScore(score)) {
        return res.status(400).json({
          success: false,
          message: "Score must be a whole number between 1 and 45",
        });
      }

      existingScore.score = Number(score);
    }

    // Update date if provided
    if (date) {
      const normalizedDate = normalizeDate(date);

      if (!normalizedDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      // Check another score doesn't already use this date
      const duplicateDate = await Score.findOne({
        user: req.user.id,
        date: normalizedDate,
        _id: { $ne: id },
      });

      if (duplicateDate) {
        return res.status(400).json({
          success: false,
          message: "Another score already exists for this date",
        });
      }

      existingScore.date = normalizedDate;
    }

    await existingScore.save();

    return res.status(200).json({
      success: true,
      message: "Score updated successfully",
      score: existingScore,
    });
  } catch (error) {
    console.error("UPDATE SCORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// DELETE SCORE
// =============================
export const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedScore = await Score.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deletedScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Score deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SCORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// ADMIN - GET USER SCORES
// =============================
export const adminGetUserScores = async (req, res) => {
  try {
    const { userId } = req.params;

    const scores = await Score.find({
      user: userId,
    })
      .sort({ date: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      count: scores.length,
      scores,
    });
  } catch (error) {
    console.error("ADMIN GET USER SCORES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// =============================
// ADMIN - UPDATE USER SCORE
// =============================

export const adminUpdateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, date } = req.body;

    const existingScore = await Score.findById(id);

    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found.",
      });
    }

    if (score !== undefined) {
      if (!isValidScore(score)) {
        return res.status(400).json({
          success: false,
          message: "Score must be a whole number between 1 and 45.",
        });
      }

      existingScore.score = Number(score);
    }

    if (date) {
      const normalizedDate = normalizeDate(date);

      if (!normalizedDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date.",
        });
      }

      const duplicateDate = await Score.findOne({
        user: existingScore.user,
        date: normalizedDate,
        _id: { $ne: existingScore._id },
      });

      if (duplicateDate) {
        return res.status(400).json({
          success: false,
          message: "Another score already exists for this date.",
        });
      }

      existingScore.date = normalizedDate;
    }

    await existingScore.save();

    return res.status(200).json({
      success: true,
      message: "Score updated successfully.",
      score: existingScore,
    });
  } catch (error) {
    console.error("ADMIN UPDATE SCORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminDeleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedScore = await Score.findByIdAndDelete(id);

    if (!deletedScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Score deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN DELETE SCORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
