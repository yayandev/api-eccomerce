import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/CategoryController.js";
import auth from "../middlewares/auth.js";
import adminOnly from "../middlewares/adminOnly.js";

const CategoryRoute = Router();

CategoryRoute.get("/categories", getCategories);
CategoryRoute.get("/categories/:id", getCategory);
CategoryRoute.post("/categories", auth, adminOnly, createCategory);
CategoryRoute.put("/categories/:id", auth, adminOnly, updateCategory);
CategoryRoute.delete("/categories/:id", auth, adminOnly, deleteCategory);

export default CategoryRoute;
