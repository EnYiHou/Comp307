import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { Booking } from "../models/Booking.js";

const router = express.Router();

router.get("/events", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      $or: [{ ownerId: req.user.id }, { participants: req.user.id }],
    })
      .populate("ownerId", "name email")
      .populate("participants", "name email")
      .sort({ startTime: 1 })
      .lean();

    res.json({
      success: true,
      data: bookings.map((booking) => ({
        id: booking._id,
        title: booking.title,
        start: booking.startTime,
        end: booking.endTime,
        status: booking.status,
        owner: booking.ownerId,
        participants: booking.participants,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
