import { Router } from "express";
import { createReview } from "../controllers/ReviewController.js";
import auth from "../middlewares/auth.js";
const ReviewRoute = Router();
ReviewRoute.post("/review", auth, createReview);
export default ReviewRoute;
