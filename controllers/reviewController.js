import Review from "../model/review.js";
import Product from "../model/product.js";
import { isAdmin } from "../utils/roleCheck.js";
import User from "../model/user.js";

// Create review
export async function createReview(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Please login to submit a review.",
    });
  }

  const { productId, rating, comment } = req.body;

  let userId;
  if (req.user._id) {
    userId = req.user._id;
  } else {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    userId = user._id;
  }

  if (!productId || !rating || !comment) {
    return res.status(400).json({
      message: "Product ID, rating, and comment are required.",
    });
  }

  try {
    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const existingReview = await Review.findOne({
      product: product._id,
      user: userId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this product.",
      });
    }

    const review = new Review({
      product: product._id,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create review.",
      error: error.message,
    });
  }
}

// Get review
export async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const reviews = await Review.find({ product: product._id })
      .populate("user", "firstName lastName img")
      .select("-product");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews.",
      error: error.message,
    });
  }
}

// Update
export async function updateReview(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const isOwner = review.user.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to update this review.",
      });
    }

    //
    const updateData = {};
    if (rating) updateData.rating = rating;
    if (comment) updateData.comment = comment;

    const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update review.",
      error: error.message,
    });
  }
}

// Delete Reviews
export async function deleteReview(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const { reviewId } = req.params;
  const userId = req.user._id;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const isOwner = review.user.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to delete this review.",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review.",
      error: error.message,
    });
  }
}
