import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToPgSqlDB, sequelize } from "./database/config.js";
import { authenticateToken, requireAdmin } from "./utils/auth.js";
import { Order } from "./models/orderModel.js";
import { OrderItem } from "./models/OrderdItem.js";
import { Product } from "./models/productModel.js";
import { Review } from "./models/reviewModel.js";
import { User } from "./models/userModel.js";
import { Notification } from "./models/notificationModel.js";
import {
  getProfile,
  googleAuthCallback,
  login,
  register,
  updateProfile,
} from "./controllers/AuthController.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getSearchSuggestions,
  updateProduct,
} from "./controllers/ProductController.js";
import {
  createNotification,
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "./controllers/NotificationController.js";
import {
  createOrder,
  getOrderById,
  getOrders,
  verifyPayment,
} from "./controllers/OrderController.js";
import {
  getAllCustomers,
  getAllOrders,
  getDashboardStats,
  updateOrderStatus,
} from "./controllers/AdminController.js";
import {
  createReview,
  getProductReviews,
} from "./controllers/ReviewController.js";
import UploadFileRouter from "./Routes/upload-image.js";

dotenv.config();

export function createServer() {
  const app = express();

  // Enhanced CORS configuration
  const corsOptions = {
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Backend server
      "http://localhost:4173", // Vite preview
      "https://localhost:5173",
      "https://localhost:3000",
      "https://localhost:4173",
      "https://indianbaazaar-backend.onrender.com/api", 
      "https://indianbaazaar-frontend.onrender.com",
      "https://www.indianbaazaar.com/api",
      "https://indianbaazaar.com",
      "https://indianbaazaar.com/api",
      "https://www.indianbaazaar.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Authorization"],
    maxAge: 86400, // 24 hours
  };

  app.use(cors(corsOptions));

  // Handle preflight requests
  app.options("*", cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  connectToPgSqlDB().catch((error : any) => {
    console.error("Database connection failed:", error.message);
    console.log("⚠️  Running in development mode without database");
  });

  // Define associations after all models are loaded
  // Order and User associations
  User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
  Order.belongsTo(User, { foreignKey: "user_id", as: "User" });

  // Order and OrderItem associations
  Order.hasMany(OrderItem, { foreignKey: "order_id", as: "OrderItems" });
  OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "Order" });

  // Product and OrderItem associations
  Product.hasMany(OrderItem, { foreignKey: "product_id", as: "OrderItems" });
  OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "Product" });

  // Review and User associations
  User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
  Review.belongsTo(User, { foreignKey: "user_id", as: "User" });

  // Review and Product associations
  Product.hasMany(Review, { foreignKey: "product_id", as: "productReviews" });
  Review.belongsTo(Product, { foreignKey: "product_id", as: "Product" });

  // Notification and User associations
  User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
  Notification.belongsTo(User, { foreignKey: "user_id", as: "User" });

  // Sync database tables - models updated
  sequelize
    .sync({ force: false, alter: false })
    .then(() => {
      console.log("✅ Database tables synced successfully");
    })
    .catch((err : any) => {
      console.error("❌ Unable to sync tables:", err.message);
    });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Indian Baazaar Backend",
    });
  });

  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/google", googleAuthCallback);
  app.get("/api/auth/profile", authenticateToken, getProfile);
  app.put("/api/auth/profile", authenticateToken, updateProfile);

  app.get("/api/products", getAllProducts);
  app.get("/api/products/search/suggestions", getSearchSuggestions);
  app.get("/api/products/category/:category", getProductsByCategory);
  app.get("/api/products/:id", getProductById);
  app.post("/api/products", authenticateToken, requireAdmin, createProduct);
  app.put("/api/products/:id", authenticateToken, requireAdmin, updateProduct);
  app.delete(
    "/api/products/:id",
    authenticateToken,
    requireAdmin,
    deleteProduct,
  );

  app.get("/api/notifications", authenticateToken, getUserNotifications);
  app.patch(
    "/api/notifications/:id/read",
    authenticateToken,
    markNotificationAsRead,
  );
  app.post(
    "/api/notifications",
    authenticateToken,
    requireAdmin,
    createNotification,
  );

  app.delete(
    "/api/notifications/:id",
    authenticateToken,
    requireAdmin,
    deleteNotification,
  );

  app.post("/api/orders", authenticateToken, createOrder);
  app.post("/api/payments/verify", authenticateToken, verifyPayment);
  app.get("/api/orders", authenticateToken, getOrders);
  app.get("/api/orders/:id", authenticateToken, getOrderById);

  app.get(
    "/api/admin/customers",
    authenticateToken,
    requireAdmin,
    getAllCustomers,
  );
  app.get("/api/admin/orders", authenticateToken, requireAdmin, getAllOrders);
  app.get(
    "/api/admin/stats",
    authenticateToken,
    requireAdmin,
    getDashboardStats,
  );
  app.patch(
    "/api/admin/orders/:id/status",
    authenticateToken,
    requireAdmin,
    updateOrderStatus,
  );

  app.post("/api/reviews", authenticateToken, createReview);
  app.get("/api/products/:productId/reviews", getProductReviews);
  app.use('/api/file', UploadFileRouter)


  return app;
}
