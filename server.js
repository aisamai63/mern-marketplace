import listingRoutes from "./routes/listingRoutes.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/listings", listingRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});