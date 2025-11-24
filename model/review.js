import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products", 
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", 
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, 
      max: 5, 
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model("reviews", reviewSchema);
export default Review;