import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "belanjakeun",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const parser = multer({ storage: storage });

export default parser;
