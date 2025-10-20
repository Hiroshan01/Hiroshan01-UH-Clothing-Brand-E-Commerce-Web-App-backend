import express from "express";
import { createUser } from "../controllers/userController.js";

const userRoute = express.Router();

// Static routes first
userRoute.post("/", createUser);

export default userRoute;
