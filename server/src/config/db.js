import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  console.log("uri:", env.mongoUri);
  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
};
