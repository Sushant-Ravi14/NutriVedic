const { cloudinary } = require('../config/cloudinary');

const uploadBuffer = (buffer, folder = 'nutrivedic') => {
  return new Promise((resolve, reject) => {
    if (!cloudinary) {
      // Mock upload for local dev without cloudinary config
      console.log('Mock Cloudinary Upload');
      return resolve({ secure_url: 'https://via.placeholder.com/150', public_id: 'mock_id' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

module.exports = { uploadBuffer };
