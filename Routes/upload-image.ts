import express from "express";
import { Uploader, uploadImage } from "../controllers/ImageController.ts";

const UploadFileRouter = express.Router();

UploadFileRouter.post('/upload-image', Uploader.single('image'), uploadImage);


export default UploadFileRouter;
