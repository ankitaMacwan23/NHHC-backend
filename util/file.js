const fs = require('fs');

exports.deleteFile = (filePath) => {
  if (!filePath) return; // Don't try to delete if the file path is empty

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  });
};
