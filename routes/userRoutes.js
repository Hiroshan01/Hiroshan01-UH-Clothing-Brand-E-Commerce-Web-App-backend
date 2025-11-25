import express from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUserProfile,
  getUsers,
  googleLogin,
  resetPassword,
  sendOtp,
  updateUser,
  userLogin,
} from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/", createUser);

userRoute.post("/login", userLogin);
userRoute.post("/login/google", googleLogin);
userRoute.get("/profile", getUserProfile);
userRoute.get("/get_users", getUsers); 
userRoute.get("/:id", getUserById);
userRoute.delete("/:id", deleteUser);
userRoute.put("/:id", updateUser);
userRoute.post("/send-otp", sendOtp);
userRoute.post("/reset-password", resetPassword)

export default userRoute;
