import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { Booking } from "../models/Booking.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const slots = await Booking.find({
      visibility: "public",
      status: "open",
      startTime: { $gte: new Date() },
      participants: { $ne: req.user.id },
    })
      .populate("ownerId", "name email")
      .sort({ startTime: 1 })
      .lean();

    res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
});

export default router;
