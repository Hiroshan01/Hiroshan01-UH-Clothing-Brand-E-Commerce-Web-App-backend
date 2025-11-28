import express from "express";
import {
  createOrder,
  deleteOrder,
  getSalesData,
  getTodaySalesData,
  getUserOrders,
  updateAdminOrderStatus,
} from "../controllers/orderController.js";

const orderRoute = express.Router();

orderRoute.post("/", createOrder);
orderRoute.get("/", getUserOrders);
orderRoute.get("/sales", getSalesData);
orderRoute.get("/sales/today", getTodaySalesData);
orderRoute.put("/:orderId/:status", updateAdminOrderStatus);
orderRoute.delete("/:orderId", deleteOrder);

export default orderRoute;
