// EnYi Hou (261165635)

import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env or the PM2 environment.");
  }
  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
};
