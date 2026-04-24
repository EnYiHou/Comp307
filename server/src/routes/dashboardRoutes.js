import express from 'express';
import { Booking, BookingRequest, BookingPoll } from "../models/Booking.js";
import User from "../models/User.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/appointments', async (req, res) => {
    console.log("wtf");
    res.json(["Appointment 1", "Appointment 2", "Appointment 3"]);
});


router.post('/createBookingSlot', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookingData = req.body;

        if (bookingData.bookingMode === "slot") {
            const createdSlots = await createBookingSlot(userId, bookingData);
            return res.status(201).json({
                message: "Booking slots created successfully.",
            });
        }

        else if (bookingData.bookingMode === "group") {
            const createdSlots = await createBookingGroup(userId, bookingData);

            return res.status(201).json({
                message: "Booking polls created successfully.",
            });
        }

    } catch (error) {
        console.error("Create booking error:", error);
        return res.status(500).json({
            message: "Failed to create booking"
        });
    }

});

async function createBookingSlot(userId, bookingData) {
    const slotsToCreate = bookingData.selectedSlots.map((slot) => ({
        ownerId: userId,
        title: bookingData.title,
        description: bookingData.description,
        startTime: new Date(slot.start),
        endTime: new Date(slot.end),
        visibility: bookingData.visibility,
        capacity: bookingData.capacity,
        status: "open",
        participants: [],
    }))

    return await Booking.insertMany(slotsToCreate);
};

async function createBookingGroup(userId, bookingData) {
    let candidateSlots = [];
    const method = bookingData.pollMethod;

    if (method === "calendar") {
        candidateSlots = bookingData.selectedSlots.map((slot) => ({
            startTime: new Date(slot.start),
            endTime: new Date(slot.end),
            selectedByUsers: []
        }));
    }

    else if (method === "heatmap") {
        candidateSlots = generateHeatmapCandidates(bookingData.rangeStart, bookingData.rangeEnd);
    }

    const pollsToCreate = {
        ownerId: userId,
        title: bookingData.title,
        description: bookingData.description,
        invitedUsers: [],
        method: bookingData.pollMethod,
        candidateSlots,
        rangeStart: bookingData.rangeStart ? new Date(bookingData.rangeStart) : null,
        rangeEnd: bookingData.rangeEnd ? new Date(bookingData.rangeEnd) : null,
        status: "collectingVotes",
    }

    return await BookingPoll.create(pollsToCreate)
};

function generateHeatmapCandidates(rangeStart, rangeEnd) {
    const SLOTS_MINUTES_INTERVAL = 30;
    const DAYS_HOUR_START = 8;
    const DAYS_HOUR_END = 18;

    const slots = [];

    const startDate = new Date(`${rangeStart}T00:00:00`);
    const endDate = new Date(`${rangeEnd}T00:00:00`);
    const currentDay = new Date(startDate);

    while (currentDay <= endDate) {
        const daySlotStart = new Date(currentDay)
        daySlotStart.setHours(DAYS_HOUR_START, 0, 0, 0);
        const daySLotEnd = new Date(currentDay)
        daySLotEnd.setHours(DAYS_HOUR_END, 0, 0, 0);
        let currentSlotStart = new Date(daySlotStart);
        while (currentSlotStart <= daySLotEnd) {
            const currentSlotEnd = new Date(currentSlotStart);
            currentSlotEnd.setMinutes(currentSlotEnd.getMinutes() + SLOTS_MINUTES_INTERVAL);
            slots.push({
                startTime: new Date(currentSlotStart),
                endTime: new Date(currentSlotEnd),
                selectedByUsers: []
            })
            currentSlotStart = currentSlotEnd;
        }
        currentDay.setDate(currentDay.getDate() + 1);
    }
    return slots;
}

export default router






router.get('/searchOwners', requireAuth, makeUserSearchHandler(["OWNER"]));
router.get('/searchAll', requireAuth, makeUserSearchHandler(["USER", "OWNER"]));

function makeUserSearchHandler(roles) {
    return async function (req, res) {
        try {
            const query = (req.query.q || "").trim();
            const users = await searchAllUsers(req.user.id, query, roles);
            return res.status(200).json(users);
        }
        catch (error) {
            console.error("User search error:", error);
            return res.status(500).json({
                message: "Failed to search users",
            });
        }
    };
}

function searchAllUsers(id, query, roles) {

    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    const users = await User.find({
        role: { $in: roles },
        _id: { $ne: id },
        $or: [
            { name: regex },
            { name: regex },
        ],
    })
        .select("_id name email role")
        .sort({ name: 1 })
        .limit(10);

    return users;
}

