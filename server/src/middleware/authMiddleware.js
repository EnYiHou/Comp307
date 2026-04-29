import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

// Main: Enyi Hou
// Extra Bugfixes: Ronald Zhang

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

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}
