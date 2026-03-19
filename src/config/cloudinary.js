// devspace-backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER_NAME || 'DevSpace_App_Images', 
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'], // 👈 Iski spelling theek karni thi
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };