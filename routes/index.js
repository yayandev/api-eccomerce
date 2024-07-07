import { Router } from "express";
import userRoute from "./UserRoute.js";
import CategoryRoute from "./CategoryRoute.js";
import ProductRoute from "./ProductRoute.js";

const router = Router();
router.use(userRoute);
router.use(CategoryRoute);
router.use(ProductRoute);
export default router;
