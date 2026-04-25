import express from "express";
import { sendPlaceholder } from "../utils/response.js";
import { acceptBooking, getBookingsByOwner } from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", (req, res) => sendPlaceholder(res, "Bookings"));
router.get("/owner", getBookingsByOwner);
router.post("/:bookingId/accept", acceptBooking);

export default router;
