import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const users = await User.find().select("_id name email role").sort({ createdAt: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res) => {
  res.status(405).json({
    message: "Use /api/auth/register to create users",
  });
});

export default router;
