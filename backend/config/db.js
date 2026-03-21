const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoSrvUri = process.env.MONGO_URI;
  const mongoDirectUri = process.env.MONGO_URI_DIRECT;

  if (!mongoSrvUri && !mongoDirectUri) {
    throw new Error("MONGO_URI (or MONGO_URI_DIRECT) is not configured");
  }

  try {
    const conn = await mongoose.connect(mongoSrvUri || mongoDirectUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const isSrvDnsRefused =
      mongoSrvUri &&
      /querySrv ECONNREFUSED/i.test(error.message || "");

    if (isSrvDnsRefused && mongoDirectUri) {
      try {
        console.warn(
          "MongoDB SRV DNS lookup failed. Retrying with MONGO_URI_DIRECT...",
        );
        const conn = await mongoose.connect(mongoDirectUri);
        console.log(`MongoDB Connected (direct): ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        throw new Error(`MongoDB connection failed: ${fallbackError.message}`);
      }
    }

    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
