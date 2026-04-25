import express from "express";
import { sendPlaceholder } from "../utils/response.js";
import {
  acceptBooking,
  getBookingsByOwner,
  getOwnerBookingById,
  updateOwnerBooking,
} from "../controllers/bookingController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => sendPlaceholder(res, "Bookings"));
router.get("/owner", getBookingsByOwner);
router.get("/:bookingId", requireAuth, getOwnerBookingById);
router.patch("/:bookingId", requireAuth, updateOwnerBooking);
router.post("/:bookingId/accept", acceptBooking);

export default router;
