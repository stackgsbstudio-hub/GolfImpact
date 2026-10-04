import multer from "multer";
import path from "path";

// =====================================================
// COMMON FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/octet-stream",
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const extension = path.extname(file.originalname).toLowerCase();

  const validMimeType = allowedMimeTypes.includes(file.mimetype);
  const validExtension = allowedExtensions.includes(extension);

  if (!validMimeType || !validExtension) {
    return cb(
      new Error("Only JPG, JPEG, PNG and WEBP images are allowed."),
      false,
    );
  }

  cb(null, true);
};

// =====================================================
// WINNER PROOF UPLOAD
// =====================================================

const proofUpload = multer({
  storage: multer.memoryStorage(),

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// CHARITY IMAGE UPLOAD
// =====================================================

export const charityUpload = multer({
  storage: multer.memoryStorage(),

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default proofUpload;
