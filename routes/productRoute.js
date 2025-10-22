import express from "express";
import {
  deleteProduct,
  getProduct,
  saveProduct,
  updateProduct,
} from "../controllers/productController.js";

const productRoute = express.Router();

productRoute.post("/", saveProduct);
productRoute.get("/", getProduct);
productRoute.delete("/:productId", deleteProduct);
productRoute.put("/:productId", updateProduct);

export default productRoute;
