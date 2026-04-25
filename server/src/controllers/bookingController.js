import { Booking } from "../models/Booking.js";

export const getBookingsByOwner = async (req, res, next) => {
    try {
        const { ownerId, userId } = req.query;

        const bookingQuery = {
            ownerId,
            visibility: "public",
            status: "open",
            startTime: { $gte: new Date() },
        };

        if (userId) {
            bookingQuery.participants = { $ne: userId };
        }

        const bookings = await Booking.find(bookingQuery).sort({ startTime: 1 });

        res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

export const acceptBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { userId } = req.body;

        const booking = await Booking.findOne({
            _id: bookingId,
            visibility: "public",
            status: "open",
            startTime: { $gte: new Date() },
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.participants.some((participantId) => participantId.toString() === userId)) {
            return res.status(400).json({ message: "You have already booked this appointment" });
        }

        if (booking.participants.length >= booking.capacity) {
            return res.status(400).json({ message: "This booking is already full" });
        }

        booking.participants.push(userId);

        if (booking.participants.length >= booking.capacity) {
            booking.status = "reserved";
        }

        await booking.save();

        res.json({
            success: true,
            message: "Booking accepted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
