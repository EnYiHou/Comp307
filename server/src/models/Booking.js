import mongoose from "mongoose";

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
            default: "draft",
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


const bookingRequestSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },
        proposedTitle: {
            type: String,
            trim: true,
        },
        proposedDescription: {
            type: String,
            trim: true,
        },
        createdBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

const pollSlotSchema = new mongoose.Schema(
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
    },
    { _id: false }
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
const Request = mongoose.model("Request", bookingRequestSchema);
const BookingPoll = mongoose.model("BookingPoll", bookingPollsSchema);


export default Booking;
export default Request;
export default BookingPoll;

