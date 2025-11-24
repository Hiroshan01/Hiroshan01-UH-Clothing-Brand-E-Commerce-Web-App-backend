import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/", getAllReviews);
reviewRouter.get("/:productId", getProductReviews);
reviewRouter.delete("/:reviewId", deleteReview);

export default reviewRouter;
