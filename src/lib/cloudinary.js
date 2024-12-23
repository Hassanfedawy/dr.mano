import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dfnhgsxua',
  api_key: 'your_api_key', // Replace with your API key
  api_secret: 'your_api_secret', // Replace with your API secret
});

export async function uploadImage(imageUrl) {
  try {
    const response = await cloudinary.uploader.upload(imageUrl, {
      upload_preset: 'wjlbtoqe', // Replace with your Cloudinary preset
    });
    return response.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed.');
  }
}
