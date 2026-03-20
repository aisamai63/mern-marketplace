const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
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
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(morgan(morganFormat));
app.use("/api", apiLimiter);

// Health route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "API is running...",
    },
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/listings", listingRoutes);

// Global handlers
app.use(notFound);
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`,
      );
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
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
