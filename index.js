require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");

// Routes
const usersRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const plantRoutes = require("./routes/plant");
const fertilizerRoutes = require("./routes/fertilize");
const diseaseRoutes = require("./routes/disease");
const dashboardRoutes = require("./routes/dashboard");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const blogRoutes = require("./routes/blogRoutes");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");
const adminDashboardRoutes = require("./routes/adminDashboard");

// Error handling
const globalError = require("./middlewares/globalError");
const AppError = require("./utils/appError");

const app = express();
console.log("DEBUG: Updated index.js is running");
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

// Database connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = mongoose.connection.readyState === 1;

    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    isConnected = false;
    console.error("MongoDB Connection Failed:", err.message);
    throw err;
  }
};

// Ensure database connection BEFORE handling routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database middleware error:", err);

    return res.status(500).json({
      status: "error",
      message: "Database connection failed",
      details: err.message,
    });
  }
});

// Main route
app.get("/", (req, res) => {
  res.send("Welcome to Gheras backend project!");
});

// API routes
app.use("/api/users", usersRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/fertilizers", fertilizerRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api", blogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin-dashboard", adminDashboardRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can not find this route: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalError);

// Local server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Vercel serverless export
module.exports = app;
