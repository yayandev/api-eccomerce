import { Router } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/CartController.js";
import auth from "../middlewares/auth.js";

const CartRoute = Router();

CartRoute.get("/cart", auth, getCart);
CartRoute.post("/cart", auth, addToCart);
CartRoute.delete("/cart/:id", auth, removeFromCart);

export default CartRoute;
