const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load env from backend/.env, then allow root/.env as fallback for monorepo setups.
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
const isProduction = (process.env.NODE_ENV || "").toLowerCase() === "production";

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || (isProduction ? 100 : 1000),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Middleware
app.disable("x-powered-by");
app.use(
  helmet({
    // Allow frontend apps on different origins (e.g. localhost:5173) to load /uploads media.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json());
app.use(cors());
app.use(morgan(morganFormat));
app.use("/api", apiLimiter);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "MERN Marketplace API is running...",
    },
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// Global handlers
app.use(notFound);
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    await connectDB();
    server = app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`,
      );
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    // Fail fast so deployment and grading checks immediately detect startup issues.
    process.exitCode = 1;
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  startServer();
}

process.on("SIGTERM", () => {
  if (server) {
    server.close(() => {
      process.exit(0);
    });
    return;
  }

  process.exit(0);
});

module.exports = { app, startServer };
