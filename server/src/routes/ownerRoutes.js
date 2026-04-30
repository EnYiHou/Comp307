import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = (req.query.q || "").trim();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    const owners = await User.find({
      _id: { $ne: req.user.id },
      role: "OWNER",
      email: /@mcgill\.ca$/i,
      ...(query
        ? {
            $or: [{ name: regex }, { email: regex }],
          }
        : {}),
    })
      .select("_id name email role")
      .sort({ name: 1 });

    res.json({ success: true, data: owners });
  } catch (error) {
    next(error);
  }
});

router.get("/all-mcgill", requireAuth, async (req, res, next) => {
  try {
    const query = (req.query.q || "").trim();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    const owners = await User.find({
      _id: { $ne: req.user.id },
      role: "OWNER",
      email: /@mcgill\.ca$/i,
      ...(query
        ? {
            $or: [{ name: regex }, { email: regex }],
          }
        : {}),
    })
      .select("_id name email role")
      .sort({ name: 1 })
      .limit(25);

    res.json({ success: true, data: owners });
  } catch (error) {
    next(error);
  }
});

router.get("/:ownerId", requireAuth, async (req, res, next) => {
  try {
    const owner = await User.findOne({
      _id: req.params.ownerId,
      role: "OWNER",
    }).select("_id name email role");

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    res.json({ success: true, data: owner });
  } catch (error) {
    next(error);
  }
});

export default router;
