import crypto from "crypto";
import express from "express";
import { env } from "../config/env.js";
import requireAuth, { requireRole } from "../middleware/authMiddleware.js";
import { Booking } from "../models/Booking.js";
import InviteLink from "../models/InviteLink.js";
import User from "../models/User.js";

const router = express.Router();

router.use(requireAuth);

function buildInviteUrl(token) {
  const clientUrl = env.clientUrl || "http://localhost:3001";
  return `${clientUrl.replace(/\/$/, "")}/invite/${token}`;
}

router.get("/owner", requireRole("OWNER"), async (req, res, next) => {
  try {
    const links = await InviteLink.find({ ownerId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: links.map((link) => ({
        ...link,
        url: buildInviteUrl(link.token),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireRole("OWNER"), async (req, res, next) => {
  try {
    const token = crypto.randomBytes(18).toString("hex");
    const link = await InviteLink.create({
      ownerId: req.user.id,
      token,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: {
        ...link.toObject(),
        url: buildInviteUrl(link.token),
      },
      message: "Invite link created successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:linkId/revoke", requireRole("OWNER"), async (req, res, next) => {
  try {
    const link = await InviteLink.findOneAndUpdate(
      {
        _id: req.params.linkId,
        ownerId: req.user.id,
      },
      { isActive: false },
      { new: true },
    );

    if (!link) {
      return res.status(404).json({ message: "Invite link not found" });
    }

    res.json({
      success: true,
      data: {
        ...link.toObject(),
        url: buildInviteUrl(link.token),
      },
      message: "Invite link revoked",
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:linkId", requireRole("OWNER"), async (req, res, next) => {
  try {
    const link = await InviteLink.findOneAndDelete({
      _id: req.params.linkId,
      ownerId: req.user.id,
    });

    if (!link) {
      return res.status(404).json({ message: "Invite link not found" });
    }

    res.json({ success: true, message: "Invite link deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/:token", async (req, res, next) => {
  try {
    const link = await InviteLink.findOne({
      token: req.params.token,
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).lean();

    if (!link) {
      return res.status(404).json({ message: "Invite link not found or expired" });
    }

    const owner = await User.findById(link.ownerId).select("_id name email role").lean();
    if (!owner) {
      return res.status(404).json({ message: "Invite owner not found" });
    }

    const bookings = await Booking.find({
      ownerId: owner._id,
      visibility: "public",
      status: "open",
      startTime: { $gte: new Date() },
      participants: { $ne: req.user.id },
    })
      .sort({ startTime: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        link,
        owner,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
