/**
 * NutriVedic Image Compression Utility
 */
import imageCompression from 'browser-image-compression';

export const compressImage = async (file, customOptions = {}) => {
  if (!file) return null;
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    ...customOptions
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed, returning original file:', error);
    return file;
  }
};
