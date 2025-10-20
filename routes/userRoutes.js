import express from "express";
import {
  createUser,
  getUserById,
  getUsers,
  userLogin,
} from "../controllers/userController.js";

const userRoute = express.Router();

// Static routes first
userRoute.post("/", createUser);
userRoute.post("/login", userLogin);
userRoute.get("/get_users", getUsers); // ← Should use getUsers, not getUserById
userRoute.get("/:id", getUserById);

export default userRoute;
