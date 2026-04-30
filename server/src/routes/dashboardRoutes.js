import express from 'express';
import { Booking, BookingRequest, BookingPoll } from "../models/Booking.js";
import User from "../models/User.js";
import requireAuth, { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/appointments', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const appointments = await Booking.find({
            participants: userId,
            startTime: { $gte: new Date() },
        })
            .populate("ownerId", "name email")
            .sort({ startTime: 1 })
            .lean();

        return res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
});


router.post('/createBookingSlot', requireAuth, requireRole("OWNER"), async (req, res) => {
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
    const recurrenceCount = Math.max(1, Number(bookingData.recurrenceCount) || 1);
    const capacity = Math.max(1, Number(bookingData.capacity) || 1);
    const slotsToCreate = bookingData.selectedSlots.flatMap((slot) => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);

        return Array.from({ length: recurrenceCount }, (_, weekOffset) => ({
            ownerId: userId,
            title: bookingData.title,
            description: bookingData.description,
            startTime: addWeeks(slotStart, weekOffset),
            endTime: addWeeks(slotEnd, weekOffset),
            visibility: bookingData.visibility,
            capacity,
            status: "open",
            participants: [],
        }));
    });

    return await Booking.insertMany(slotsToCreate);
};

function addWeeks(date, weekOffset) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + (weekOffset * 7));
    return nextDate;
}

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
        invitedUsers: bookingData.invitedUsers,
        method: bookingData.pollMethod,
        candidateSlots,
        rangeStart: bookingData.rangeStart ? new Date(bookingData.rangeStart) : null,
        rangeEnd: bookingData.rangeEnd ? new Date(bookingData.rangeEnd) : null,
        status: "collectingVotes",
        recurrenceCount: Math.max(1, Number(bookingData.recurrenceCount) || 1),
    }

    return await BookingPoll.create(pollsToCreate)
};

function generateHeatmapCandidates(rangeStart, rangeEnd) {
    const SLOTS_MINUTES_INTERVAL = 30;
    const DAYS_HOUR_START = 6;
    const DAYS_HOUR_END = 23;

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
        while (currentSlotStart < daySLotEnd) {
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

router.get('/searchOwners', requireAuth, makeUserSearchHandler(["OWNER"], { availableOnly: true }));
router.get('/searchMcGillOwners', requireAuth, makeUserSearchHandler(["OWNER"], { emailDomain: "mcgill.ca" }));
router.get('/searchAll', requireAuth, makeUserSearchHandler(["USER", "OWNER"]));

function makeUserSearchHandler(roles, options = {}) {
    return async function (req, res) {
        try {
            const query = (req.query.q || "").trim();
            const users = await searchAllUsers(req.user.id, query, roles, options);
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

async function searchAllUsers(id, query, roles, options = {}) {

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");
    const userQuery = {
        role: { $in: roles },
        _id: { $ne: id },
        $or: [
            { name: regex },
            { email: regex },
        ],
    };

    if (options.availableOnly) {
        const availableOwnerIds = await Booking.distinct("ownerId", {
            visibility: "public",
            status: "open",
            startTime: { $gte: new Date() },
            participants: { $ne: id },
        });

        userQuery._id = { $ne: id, $in: availableOwnerIds };
    }

    if (options.emailDomain) {
        userQuery.email = new RegExp(`@${options.emailDomain.replace(".", "\\.")}$`, "i");
    }

    const users = await User.find(userQuery)
        .select("_id name email role")
        .sort({ name: 1 })
        .limit(10);

    return users;
}

router.get('/getInvites', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const invites = await BookingPoll.find({
            invitedUsers: userId,
            status: "collectingVotes",
        })
            .select("_id title description candidateSlots ownerId method rangeStart rangeEnd status updatedAt")
            .populate("ownerId", "_id name email")
            .sort({ updatedAt: -1 })
            .lean();

        const safeInvites = invites.map((invite) => {
            const safeCandidateSlots = invite.candidateSlots.map((slot) => {
                const selectedByUsers = slot.selectedByUsers;
                const selectedByCurrentUser = selectedByUsers.some((selectedUserId) => String(selectedUserId) === String(userId));

                return {
                    _id: slot._id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    voteCount: selectedByUsers.length,
                    selectedByCurrentUser,
                }
            });

            const voteAny = safeCandidateSlots.some((slot) => slot.selectedByCurrentUser);
            return {
                _id: invite._id,
                title: invite.title,
                description: invite.description,
                candidateSlots: safeCandidateSlots,
                ownerId: invite.ownerId,
                method: invite.method,
                rangeStart: invite.rangeStart,
                rangeEnd: invite.rangeEnd,
                status: invite.status,
                updatedAt: invite.updatedAt,
                voteAny,
            }
        })

        res.status(200).json(safeInvites);
    }
    catch (error) {
        console.error("Failed to fetch invites: ", error);
        res.status(500).json({
            message: "Failed to retrive invites"
        });
    }
});



router.patch("/pollVoting/:pollId", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const pollId = req.params.pollId;
        const selectedSlotIds = req.body.selectedSlotIds;

        await BookingPoll.updateOne(
            {
                _id: pollId,
                invitedUsers: userId,
                status: "collectingVotes",
            },
            {
                $pull: {
                    "candidateSlots.$[].selectedByUsers": userId,
                },
            }
        );
        if (selectedSlotIds.length > 0) {
            await BookingPoll.updateOne(
                {
                    _id: pollId,
                    invitedUsers: userId,
                    status: "collectingVotes",
                },
                {
                    $addToSet: {
                        "candidateSlots.$[slot].selectedByUsers": userId,
                    },
                },
                {
                    arrayFilters: [
                        {
                            "slot._id": { $in: selectedSlotIds },
                        },
                    ],
                }
            );
        }
        res.status(200).json({
            message: "Changes saved.",
        });
    } catch (error) {
        console.error("Failed to save poll vote:", error);
        res.status(500).json({
            message: "Failed to save vote.",
        });
    }
});

router.get('/getPolls', requireAuth, requireRole("OWNER"), async (req, res) => {
    try {
        const userId = req.user.id;
        const polls = await BookingPoll.find({
            ownerId: userId,
            status: "collectingVotes",
        })
            .select("_id title description invitedUsers candidateSlots method rangeStart rangeEnd status finalSelection recurrenceCount createdBookingIds updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        const safePolls = polls.map((poll) => {
            const safeCandidateSlots = poll.candidateSlots.map((slot) => ({
                _id: slot._id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                voteCount: slot.selectedByUsers.length,
            }));

            return {
                _id: poll._id,
                title: poll.title,
                description: poll.description,
                candidateSlots: safeCandidateSlots,
                method: poll.method,
                rangeStart: poll.rangeStart,
                rangeEnd: poll.rangeEnd,
                status: poll.status,
                finalSelection: poll.finalSelection,
                recurrenceCount: poll.recurrenceCount,
                createdBookingIds: poll.createdBookingIds,
                updatedAt: poll.updatedAt,
            };
        });

        res.status(200).json(safePolls);
    }
    catch (error) {
        console.error("Failed to fetch owner polls: ", error);
        res.status(500).json({
            message: "Failed to retrieve polls"
        });
    }
});

router.delete("/polls/:pollId", requireAuth, requireRole("OWNER"), async (req, res, next) => {
    try {
        const poll = await BookingPoll.findOneAndDelete({
            _id: req.params.pollId,
            ownerId: req.user.id,
        });

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found.",
            });
        }

        res.json({
            success: true,
            data: poll,
            message: "Poll deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
});

router.patch("/pollDecision/:pollId", requireAuth, requireRole("OWNER"), async (req, res) => {
    try {
        const userId = req.user.id;
        const pollId = req.params.pollId;
        const finalSlotId = req.body.finalSlotId;

        const poll = await BookingPoll.findOne({
            _id: pollId,
            ownerId: userId,
            status: "collectingVotes",
        });

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found.",
            });
        }

        const finalSlot = poll.candidateSlots.find((slot) => String(slot._id) === String(finalSlotId));

        if (!finalSlot) {
            return res.status(400).json({
                message: "Invalid final slot.",
            });
        }

        const recurrenceCount = Math.max(1, Number(poll.recurrenceCount) || 1);
        const participants = [...new Set(poll.invitedUsers.map((id) => String(id)))];
        const createdBookings = await Booking.insertMany(
            Array.from({ length: recurrenceCount }, (_, weekOffset) => ({
                ownerId: userId,
                title: poll.title,
                description: poll.description,
                startTime: addWeeks(finalSlot.startTime, weekOffset),
                endTime: addWeeks(finalSlot.endTime, weekOffset),
                visibility: "public",
                status: "reserved",
                participants,
                capacity: Math.max(participants.length, 1),
            })),
        );

        poll.status = "finalized";
        poll.finalSelection = {
            startTime: finalSlot.startTime,
            endTime: finalSlot.endTime,
        };
        poll.createdBookingIds = createdBookings.map((booking) => booking._id);
        await poll.save();

        res.status(200).json({
            message: "Changes saved.",
        });
    } catch (error) {
        console.error("Failed to save poll decision:", error);
        res.status(500).json({
            message: "Failed to save final decision.",
        });
    }
});

export default router
