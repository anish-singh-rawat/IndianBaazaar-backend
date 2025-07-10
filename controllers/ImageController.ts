import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const Uploader = multer({ storage: multer.memoryStorage() });

export const uploadImage = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { buffer, originalname } = req.file;

    cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: `images/${Date.now()}_${originalname}`,
        folder: "uploads"
      },
      (error : any, result: any) => {
        if (error) {
          console.error('Error uploading image to Cloudinary:', error);
          return res.status(500).json({ message: 'Error uploading image.' });
        }

        const imageUrl = result.secure_url;
        return res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
      }
    ).end(buffer);

  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};