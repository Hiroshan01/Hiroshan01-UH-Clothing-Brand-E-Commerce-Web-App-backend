import express from "express";
import {
  createOrder,
  getUserOrders,
  updateAdminOrderStatus,
} from "../controllers/orderController.js";

const orderRoute = express.Router();

orderRoute.post("/", createOrder);
orderRoute.get("/", getUserOrders);
orderRoute.put("/:orderId/:status", updateAdminOrderStatus);

export default orderRoute;
