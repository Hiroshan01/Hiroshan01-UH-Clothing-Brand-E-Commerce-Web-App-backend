import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const dbURI = process.env.DB_URI;

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Database Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
