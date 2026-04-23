import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
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
      default: "",
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
    location: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED", "CANCELLED"],
      default: "AVAILABLE",
    },
    recurringSeriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringSeries",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Slot", slotSchema);
