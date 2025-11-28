import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please Enter product category"],
      enum: {
        values: ["Men", "Women", "Kids","Men-Women"],
        message: "Please select a valid category",
      },
    },
    size: {
      type: String,
      required: true,
      enum: {
        values: ["S", "M", "L", "XL","S | M | L | XL"],
        message: "Please select a valid category",
      },
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    labelledPrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("products", productSchema);
export default Product;
