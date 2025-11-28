import express from "express";
import bodyParser from "body-parser";
import userRoute from "./routes/userRoutes.js";
import connectDB from "./config/configDB.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

dotenv.config();

let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for JWT verification
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        req.user = decoded;
        next();
      } else {
        console.log("Invalid token:", err.message);
        res.status(403).json({
          message: "Invalid Token",
        });
      }
    });
  } else {
    next();
  }
});

connectDB();

// Routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/review", reviewRouter);

// Root route for testing
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Remove app.listen for Vercel - export the app instead
export default app;

// import express from "express";
// import bodyParser from "body-parser";
// import userRoute from "./routes/userRoutes.js";
// import connectDB from "./config/configDB.js";
// import jwt from "jsonwebtoken";
// import cors from "cors";
// import dotenv from "dotenv";
// import productRoute from "./routes/productRoute.js";
// import orderRoute from "./routes/orderRoute.js";
// import reviewRouter from "./routes/reviewRoute.js";

// dotenv.config();

// let app = express();
// app.use(cors());
// app.use(bodyParser.json()); //Middeleware
// app.use(express.urlencoded({ extended: true }));

// //Middleware;
// app.use((req, res, next) => {
//   const tokenString = req.header("Authorization");
//   if (tokenString != null) {
//     const token = tokenString.replace("Bearer ", "");

//     jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
//       if (decoded != null) {
//         req.user = decoded;
//         next();
//       } else {
//         console.log("Invalid token:", err.message);
//         res.status(403).json({
//           message: "Invalid Token ",
//         });
//       }
//     });
//   } else {
//     next();
//   }
// });

// connectDB();
// //Routers
// app.use("/api/v1/users", userRoute);
// app.use("/api/v1/product", productRoute);
// app.use("/api/v1/order", orderRoute);
// app.use("/api/v1/review", reviewRouter);

// app.listen(5000, () => {
//   console.log("Server is running on 5000");
// });
