import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { Booking, BookingPoll } from "../models/Booking.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const meetings = await Booking.find({
      $or: [{ ownerId: req.user.id }, { participants: req.user.id }],
      capacity: { $gt: 1 },
    })
      .populate("ownerId", "name email")
      .populate("participants", "name email")
      .sort({ startTime: 1 })
      .lean();

    res.json({ success: true, data: meetings });
  } catch (error) {
    next(error);
  }
});

router.get("/polls", requireAuth, async (req, res, next) => {
  try {
    const polls = await BookingPoll.find({
      $or: [{ ownerId: req.user.id }, { invitedUsers: req.user.id }],
    })
      .populate("ownerId", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, data: polls });
  } catch (error) {
    next(error);
  }
});

export default router;
