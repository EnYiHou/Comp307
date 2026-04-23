import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export default function authMiddleware(req, res, next) {
  try {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
