const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // Cloudinary setup
const { folder, allowedFormats } = require('../config/params');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: folder,
    allowed_formats: allowedFormats
  }
});

const upload = multer({ storage });

module.exports = upload;
