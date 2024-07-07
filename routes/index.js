import { Router } from "express";
import userRoute from "./UserRoute.js";
import CategoryRoute from "./CategoryRoute.js";
import ProductRoute from "./ProductRoute.js";
import CartRoute from "./CartRoute.js";

const router = Router();
router.use(userRoute);
router.use(CategoryRoute);
router.use(ProductRoute);
router.use(CartRoute);
export default router;
