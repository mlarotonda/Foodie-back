import mongoose from "mongoose";
import {config} from "../config/config.js"

const connectDB = async () => {
  try {
    await mongoose.connect(config.linkMongoDb);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
