import express from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUserProfile,
  getUsers,
  updateUser,
  userLogin,
} from "../controllers/userController.js";

const userRoute = express.Router();

// Static routes first
userRoute.post("/", createUser);

userRoute.post("/login", userLogin);
userRoute.get("/profile", getUserProfile);
userRoute.get("/get_users", getUsers); // ← Should use getUsers, not getUserById
userRoute.get("/:id", getUserById);
userRoute.delete("/:id", deleteUser);
userRoute.put("/:id", updateUser);

export default userRoute;
