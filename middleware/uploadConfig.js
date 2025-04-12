const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to generate storage dynamically for a folder
const createStorage = (folderName) => {
  const fullPath = path.join(__dirname, '..', 'uploads', folderName);
  
  // Ensure folder exists
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + file.originalname;
      cb(null, uniqueSuffix);
    }
  });
};

module.exports = {
  serviceUpload: multer({
    storage: createStorage('services'),
    fileFilter: (req, file, cb) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (validTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG and PNG images are allowed'));
      }
    }
  })
};
