import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongoUri:
    process.env.MONGODB_URI ||
    (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD
      ? `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@comp307-berk.mj9lurk.mongodb.net/?appName=COMP307-BERK`
      : "mongodb://127.0.0.1:27017/comp307_booking"),
  jwtSecret: process.env.JWT_SECRET || "change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3001",
};
