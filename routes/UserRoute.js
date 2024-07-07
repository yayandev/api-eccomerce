import { Router } from "express";

import {
  createUser,
  loginUser,
  currentUser,
  logoutUser,
  changePassword,
} from "../controllers/UserController.js";
import auth from "../middlewares/auth.js";

const userRoute = Router();

userRoute.post("/register", createUser);
userRoute.post("/login", loginUser);
userRoute.get("/me", auth, currentUser);
userRoute.post("/logout", auth, logoutUser);
userRoute.patch("/change_password", auth, changePassword);

export default userRoute;
