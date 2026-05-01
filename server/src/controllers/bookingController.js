// EnYi Hou, Kevin Xu, Bogdan Timercan

import { Booking } from "../models/Booking.js";

function parseBookingDates(startTime, endTime) {
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (Number.isNaN(parsedStartTime.getTime()) || Number.isNaN(parsedEndTime.getTime())) {
        const error = new Error("Invalid booking date");
        error.status = 400;
        throw error;
    }

    if (parsedEndTime <= parsedStartTime) {
        const error = new Error("End time must be after start time");
        error.status = 400;
        throw error;
    }

    return { parsedStartTime, parsedEndTime };
}

function normalizeCapacity(capacity) {
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
        const error = new Error("Capacity must be at least 1");
        error.status = 400;
        throw error;
    }

    return parsedCapacity;
}

export const listMyAppointments = async (req, res, next) => {
    try {
        const appointments = await Booking.find({
            participants: req.user.id,
        })
            .populate("ownerId", "name email")
            .sort({ startTime: 1 })
            .lean();

        res.json({ success: true, data: appointments });
    } catch (error) {
        next(error);
    }
};

export const listOwnerSlots = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            ownerId: req.user.id,
        })
            .populate("participants", "name email")
            .sort({ startTime: 1 })
            .lean();

        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

export const listOwnerUpcomingBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            ownerId: req.user.id,
            startTime: { $gte: new Date() },
        })
            .populate("participants", "name email")
            .sort({ startTime: 1 })
            .lean();

        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

export const getOwnerBookingById = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findOne({
            _id: bookingId,
            ownerId: req.user.id,
        }).populate("participants", "name email");

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

        const { parsedStartTime, parsedEndTime } = parseBookingDates(startTime, endTime);
        const parsedCapacity = normalizeCapacity(capacity);

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
                capacity: parsedCapacity,
            },
            { new: true, runValidators: true },
        ).populate("participants", "name email");

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

export const deleteOwnerBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findOneAndDelete({
            _id: bookingId,
            ownerId: req.user.id,
        }).populate("participants", "name email");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            success: true,
            data: booking,
            message: "Booking deleted successfully",
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
        }).populate("ownerId", "name email");

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
            data: booking,
            message: "Appointment deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getBookingsByOwner = async (req, res, next) => {
    try {
        const { ownerId } = req.query;

        if (!ownerId) {
            return res.status(400).json({ message: "Owner is required" });
        }

        if (ownerId === req.user.id) {
            return res.json({ success: true, data: [] });
        }

        const bookings = await Booking.find({
            ownerId,
            visibility: "public",
            status: "open",
            startTime: { $gte: new Date() },
            participants: { $ne: req.user.id },
        }).sort({ startTime: 1 });

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
        const userId = req.user.id;

        const booking = await Booking.findOne({
            _id: bookingId,
            visibility: "public",
            status: "open",
            startTime: { $gte: new Date() },
        }).populate("ownerId", "name email");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.ownerId?._id?.toString() === userId || booking.ownerId?.toString() === userId) {
            return res.status(400).json({ message: "You cannot book your own slot" });
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
            data: booking,
            message: "Booking accepted successfully",
        });
    } catch (error) {
        next(error);
    }
};
