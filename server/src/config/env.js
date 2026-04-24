import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL,
  jwtSecret: process.env.JWT_SECRET,
};
