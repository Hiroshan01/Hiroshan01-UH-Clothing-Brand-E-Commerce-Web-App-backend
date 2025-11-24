import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/:productId", getProductReviews);
reviewRouter.put("/:reviewId", updateReview);
reviewRouter.delete("/:reviewId", deleteReview);

export default reviewRouter;
