require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const passport = require("passport");

dotenv.config();

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

// call error handling
const globalError = require("./middlewares/globalError");
const AppError = require("./utils/appError");

const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
const path = require("path");
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

// main route or project
app.get("/", (req, res) => {
  res.send("Welcome to Gheras backend project!");
});

// routes of departments and features
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

// error not found  404
app.use((req, res, next) => {
  next(new AppError(`Can not find this route: ${req.originalUrl}`, 404));
});

// Global Error middleware
app.use(globalError);

// Database connection function (Optimized for Serverless)
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // تقليل وقت الانتظار لسرعة اكتشاف الأخطاء
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("Connected to MongoDB successfully!");
    } catch (err) {
        console.error("Connection error:", err.message);
        throw err;
    }
};

// Middleware للتأكد من الاتصال مع كل طلب في Vercel
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

// Start server locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export for Vercel Serverless
module.exports = app;
