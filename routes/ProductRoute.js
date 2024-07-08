import { Router } from "express";
import {
  addImageProduct,
  createProduct,
  deleteImageProduct,
  deleteProduct,
  getProduct,
  getProducts,
  searchProduct,
  updateProduct,
} from "../controllers/ProductController.js";
import auth from "../middlewares/auth.js";
import adminOnly from "../middlewares/adminOnly.js";
import parser from "../utils/multer.js";

const ProductRoute = Router();
ProductRoute.get("/products", getProducts);
ProductRoute.get("/products/:id", getProduct);
ProductRoute.post(
  "/products",
  auth,
  adminOnly,
  parser.array("images", 5),
  createProduct
);

ProductRoute.patch("/products/:id", auth, adminOnly, updateProduct);
ProductRoute.delete("/products/:id", auth, adminOnly, deleteProduct);
ProductRoute.post(
  "/products/:id/deleteimage",
  auth,
  adminOnly,
  deleteImageProduct
);

ProductRoute.post(
  "/products/:id/addimage",
  auth,
  adminOnly,
  parser.array("images", 5),
  addImageProduct
);

ProductRoute.get("/products/search/:q", searchProduct);

export default ProductRoute;
