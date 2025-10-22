import express from "express";
import { createOrder } from "../controllers/orderController.js";

const orderRoute = express.Router();

orderRoute.post("/", createOrder);

export default orderRoute;
