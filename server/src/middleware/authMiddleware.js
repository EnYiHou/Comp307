import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  try {
    const cookie = req.cookies?.token;

    if (!cookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(cookie, env.jwtSecret);
    
    // Verify the user actually still exists in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}