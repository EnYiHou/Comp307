import express from "express";
import {
  acceptBooking,
  deleteMyAppointment,
  deleteOwnerBooking,
  getBookingsByOwner,
  getOwnerBookingById,
  listMyAppointments,
  listOwnerSlots,
  listOwnerUpcomingBookings,
  updateOwnerBooking,
} from "../controllers/bookingController.js";
import requireAuth, { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/my", listMyAppointments);
router.get("/owner", getBookingsByOwner);
router.get("/owner/all", requireRole("OWNER"), listOwnerSlots);
router.get("/owner/upcoming", requireRole("OWNER"), listOwnerUpcomingBookings);
router.get("/:bookingId", requireRole("OWNER"), getOwnerBookingById);
router.patch("/:bookingId", requireRole("OWNER"), updateOwnerBooking);
router.delete("/:bookingId", requireRole("OWNER"), deleteOwnerBooking);
router.delete("/:bookingId/appointment", deleteMyAppointment);
router.post("/:bookingId/accept", acceptBooking);

export default router;
