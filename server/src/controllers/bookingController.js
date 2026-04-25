import { Booking } from "../models/Booking.js";

export const getOwnerBookingById = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findOne({
            _id: bookingId,
            ownerId: req.user.id,
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            success: true,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

export const updateOwnerBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const {
            title,
            description,
            startTime,
            endTime,
            visibility,
            status,
            capacity,
        } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({
                message: "Title, start time, and end time are required",
            });
        }

        const parsedStartTime = new Date(startTime);
        const parsedEndTime = new Date(endTime);

        if (Number.isNaN(parsedStartTime.getTime()) || Number.isNaN(parsedEndTime.getTime())) {
            return res.status(400).json({ message: "Invalid booking date" });
        }

        if (parsedEndTime <= parsedStartTime) {
            return res.status(400).json({
                message: "End time must be after start time",
            });
        }

        const booking = await Booking.findOneAndUpdate(
            {
                _id: bookingId,
                ownerId: req.user.id,
            },
            {
                title,
                description,
                startTime: parsedStartTime,
                endTime: parsedEndTime,
                visibility,
                status,
                capacity,
            },
            { new: true, runValidators: true },
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            success: true,
            data: booking,
            message: "Booking updated successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMyAppointment = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            _id: bookingId,
            participants: userId,
            startTime: { $gte: new Date() },
        });

        if (!booking) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        booking.participants = booking.participants.filter(
            (participantId) => participantId.toString() !== userId,
        );

        if (booking.participants.length < booking.capacity) {
            booking.status = "open";
        }

        await booking.save();

        res.json({
            success: true,
            message: "Appointment deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

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
