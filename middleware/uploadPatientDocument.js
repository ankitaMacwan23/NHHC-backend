const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/patient-documents/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG and PNG files are allowed"), false);
  }
};

module.exports = multer({ storage, fileFilter });
