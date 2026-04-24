import express from 'express';
import { Booking, BookingRequest, BookingPoll } from "../models/Booking.js";

const router = express.Router();

router.get('/appointments', async (req, res) => {
    console.log("wtf");
    res.json(["Appointment 1", "Appointment 2", "Appointment 3"]);
});


// requireAuth
router.post('/createBookingSlot', async (req, res) => {
    console.log("YOYOYOYOYOY");
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
            const createdSlots = await createBookingSlot(userId, bookingData);

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

    const createdSlots = await Booking.insertMany(slotsToCreate);
    return createdSlots;
};

async function createBookingGroup(userId, bookingData, method) {
    let candidateSlots = [];

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
};

function generateHeatmapCandidates(rangeStart, rangeEnd) {
    const SLOTS_MINUTES_INTERVAL = 30;
    const DAYS_HOUR_START = 8;
    const DAYS_HOUR_END = 8;

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
    }
    return slots;
}

export default router


