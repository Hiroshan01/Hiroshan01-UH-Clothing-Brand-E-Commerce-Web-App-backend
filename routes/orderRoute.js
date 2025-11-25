import express from "express";
import {
  createOrder,
  getSalesData,
  getUserOrders,
  updateAdminOrderStatus,
} from "../controllers/orderController.js";

const orderRoute = express.Router();

orderRoute.post("/", createOrder);
orderRoute.get("/", getUserOrders);
orderRoute.get("/sales", getSalesData);
orderRoute.put("/:orderId/:status", updateAdminOrderStatus);

export default orderRoute;
