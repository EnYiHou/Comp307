import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { Booking } from "../models/Booking.js";
import MeetingRequest from "../models/MeetingRequest.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { ownerId, topic, message, preferredStart, preferredEnd } = req.body;

    if (!ownerId || !topic || !preferredStart || !preferredEnd) {
      return res.status(400).json({
        message: "Teacher, topic, preferred start, and preferred end are required",
      });
    }

    const owner = await User.findOne({ _id: ownerId, role: "OWNER" });

    if (!owner) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (owner._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot create a request for yourself",
      });
    }

    const parsedStart = new Date(preferredStart);
    const parsedEnd = new Date(preferredEnd);

    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
      return res.status(400).json({ message: "Invalid preferred time" });
    }

    if (parsedEnd <= parsedStart) {
      return res.status(400).json({
        message: "Preferred end must be after preferred start",
      });
    }

    const request = await MeetingRequest.create({
      requesterId: req.user.id,
      ownerId,
      topic,
      message,
      preferredStart: parsedStart,
      preferredEnd: parsedEnd,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      data: request,
      message: "Meeting request created successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/owner", requireAuth, async (req, res, next) => {
  try {
    const status = req.query.status || "PENDING";
    const requests = await MeetingRequest.find({
      ownerId: req.user.id,
      status,
    })
      .populate("requesterId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
});

router.get("/owner/upcoming", requireAuth, async (req, res, next) => {
  try {
    const now = new Date();

    const bookings = await Booking.find({
      ownerId: req.user.id,
      startTime: { $gte: now },
    })
      .populate("participants", "name email")
      .sort({ startTime: 1 });

    const upcomingBookings = bookings.map((booking) => ({
      _id: booking._id,
      title: booking.title,
      status: booking.status,
      startTime: booking.startTime,
      endTime: booking.endTime,
      participants: booking.participants || [],
    }));

    res.json({ success: true, data: upcomingBookings });
  } catch (error) {
    next(error);
  }
});

router.patch("/:requestId/status", requireAuth, async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      return res.status(400).json({ message: "Invalid request status" });
    }

    const request = await MeetingRequest.findOne({
      _id: requestId,
      ownerId: req.user.id,
      status: "PENDING",
    }).populate("requesterId", "name email");

    if (!request) {
      return res.status(404).json({ message: "Pending request not found" });
    }

    if (status === "ACCEPTED") {
      await Booking.create({
        ownerId: request.ownerId,
        title: request.topic,
        description: request.message,
        startTime: request.preferredStart,
        endTime: request.preferredEnd,
        visibility: "private",
        status: "reserved",
        participants: [request.requesterId._id],
        capacity: 1,
      });
    }

    request.status = status;
    await request.save();

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
});

export default router;
