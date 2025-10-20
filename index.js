import express from "express";
import bodyParser from "body-parser";
import userRoute from "./routes/userRoutes.js";
import connectDB from "./config/configDB.js";
// import productRoute from './routes/productRouter.js';
import jwt from "jsonwebtoken";
// import orderedRoute from './routes/orderRouter.js';
// import reviewRouter from './routes/reviewRouter.js';
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

let app = express();
app.use(cors());
app.use(bodyParser.json()); //Middeleware
app.use(express.urlencoded({ extended: true }));

//Middleware
// app.use(
//     (req, res, next) => {
//         const tokenString = req.header("Authorization")
//         if (tokenString != null) {
//             const token = tokenString.replace("Bearer ", "")

//             jwt.verify(token, process.env.JWT_KEY,
//                 (err, decoded) => {
//                     if (decoded != null) {
//                         req.user = decoded
//                         next()
//                     } else {
//                         console.log("Invalid token:", err.message);
//                         res.status(403).json({
//                             message: "Invalid Token "
//                         })
//                     }
//                 }
//             )

//         } else {
//             next()
//         }

//     }
// )

connectDB();
//Routers
app.use("/api/v1/users", userRoute);
// app.use("/api/product", productRoute)
// app.use("/api/order", orderedRoute)
// app.use("/api/review", reviewRouter)

app.listen(5000, () => {
  console.log("Server is running on 5000");
});
