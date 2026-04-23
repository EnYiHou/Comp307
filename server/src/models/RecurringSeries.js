import mongoose from "mongoose";

const recurringSeriesSchema = new mongoose.Schema(
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
    rule: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
  },
  { timestamps: true },
);

export default mongoose.model("RecurringSeries", recurringSeriesSchema);
