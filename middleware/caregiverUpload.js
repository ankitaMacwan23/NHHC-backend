const multer = require("multer");
const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).fields([
  { name: "aadhar", maxCount: 1 },
  { name: "certificate", maxCount: 1 }
]);
