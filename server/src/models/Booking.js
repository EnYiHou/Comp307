import mongoose from "mongoose";

/* Bogdan Timercan 261166331 */

const bookingSchema = new mongoose.Schema(

    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        visibility: {
            type: String,
            enum: ["private", "public"],
            default: "private",
        },
        status: {
            type: String,
            enum: ["open", "reserved"],
            default: "open",
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        capacity: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    {
        timestamps: true,
    },
);


const bookingPollsSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        invitedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        method: {
            type: String,
            enum: ["calendar", "heatmap"],
            required: true,
        },
        candidateSlots: [
            {
                startTime: {
                    type: Date,
                    required: true,
                },
                endTime: {
                    type: Date,
                    required: true,
                },
                selectedByUsers: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                ],
            }
        ],
        rangeStart: {
            type: Date,
            default: null,
        },
        rangeEnd: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ["collectingVotes", "finalized", "cancelled"],
            default: "collectingVotes",
        },
        finalSelection: {
            startTime: {
                type: Date,
                default: null,
            },
            endTime: {
                type: Date,
                default: null,
            },
        },
        recurrence: {
            type: String,
            default: null,
        },
        recurrenceCount: {
            type: Number,
            default: 1,
            min: 1,
        },
        createdBookingIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);
const BookingPoll = mongoose.model("BookingPoll", bookingPollsSchema);

export { Booking, BookingPoll };
