const cloudinary = require('cloudinary').v2;

const initCloudinary = () => {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary initialized');
  } else {
    console.log('Cloudinary config missing, image uploads will fail');
  }
};

module.exports = { cloudinary, initCloudinary };
