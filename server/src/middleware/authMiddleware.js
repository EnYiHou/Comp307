import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export default function authMiddleware(req, res, next) {
  try {
    const cookie = req.cookies?.token;

    if (!cookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = jwt.verify(cookie, env.jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}