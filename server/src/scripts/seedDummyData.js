import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import User from "../models/User.js";
import Slot from "../models/Slot.js";
import RecurringSeries from "../models/RecurringSeries.js";
import InviteLink from "../models/InviteLink.js";
import MeetingRequest from "../models/MeetingRequest.js";
import GroupMeeting from "../models/GroupMeeting.js";
import { Booking, BookingRequest, BookingPoll } from "../models/Booking.js";

const seedPassword = "Password123!";

function dateAt(dayOffset, hour, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function clearCollections() {
  await Promise.all([
    BookingRequest.deleteMany({}),
    BookingPoll.deleteMany({}),
    Booking.deleteMany({}),
    GroupMeeting.deleteMany({}),
    MeetingRequest.deleteMany({}),
    Slot.deleteMany({}),
    InviteLink.deleteMany({}),
    RecurringSeries.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function createUsers(passwordHash) {
  return User.create([
    {
      name: "Dr. Alice Bennett",
      email: "alice.bennett@mcgill.ca",
      passwordHash,
      role: "OWNER",
    },
    {
      name: "Prof. Brian Chen",
      email: "brian.chen@mcgill.ca",
      passwordHash,
      role: "OWNER",
    },
    {
      name: "Sarah Kim",
      email: "sarah.kim@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
    {
      name: "Daniel Roy",
      email: "daniel.roy@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
    {
      name: "Maya Patel",
      email: "maya.patel@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
    {
      name: "Omar Haddad",
      email: "omar.haddad@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
  ]);
}

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env before seeding.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGODB_URI);
  await clearCollections();

  const passwordHash = await bcrypt.hash(seedPassword, 10);
  const users = await createUsers(passwordHash);

  const [alice, brian, sarah, daniel, maya, omar] = users;

  const recurringSeries = await RecurringSeries.create([
    {
      ownerId: alice._id,
      title: "Alice Weekly Office Hours",
      rule: "FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8",
      startDate: dateAt(1, 10, 0),
      endDate: dateAt(29, 11, 0),
    },
    {
      ownerId: brian._id,
      title: "Brian Thesis Check-ins",
      rule: "FREQ=WEEKLY;BYDAY=TU;COUNT=6",
      startDate: dateAt(2, 14, 0),
      endDate: dateAt(37, 15, 0),
    },
  ]);

  const [aliceSeries, brianSeries] = recurringSeries;

  await Slot.create([
    {
      ownerId: alice._id,
      title: "Office Hours - Monday Morning",
      description: "General course questions and assignment support.",
      startTime: dateAt(1, 10, 0),
      endTime: dateAt(1, 10, 30),
      location: "Trottier 3120",
      status: "AVAILABLE",
      recurringSeriesId: aliceSeries._id,
    },
    {
      ownerId: alice._id,
      title: "Office Hours - Wednesday Morning",
      description: "Reserved for project milestone feedback.",
      startTime: dateAt(3, 10, 0),
      endTime: dateAt(3, 10, 30),
      location: "Trottier 3120",
      status: "BOOKED",
      recurringSeriesId: aliceSeries._id,
    },
    {
      ownerId: brian._id,
      title: "Thesis Check-in",
      description: "Short progress review for graduate students.",
      startTime: dateAt(2, 14, 0),
      endTime: dateAt(2, 14, 45),
      location: "McConnell 410",
      status: "AVAILABLE",
      recurringSeriesId: brianSeries._id,
    },
    {
      ownerId: brian._id,
      title: "Extra Advising Slot",
      description: "One-off advising appointment.",
      startTime: dateAt(5, 16, 0),
      endTime: dateAt(5, 16, 30),
      location: "Zoom",
      status: "CANCELLED",
      recurringSeriesId: null,
    },
  ]);

  await InviteLink.create([
    {
      ownerId: alice._id,
      token: "alice-office-hours-spring",
      expiresAt: dateAt(45, 23, 59),
      isActive: true,
    },
    {
      ownerId: brian._id,
      token: "brian-thesis-priority",
      expiresAt: dateAt(30, 23, 59),
      isActive: true,
    },
    {
      ownerId: brian._id,
      token: "expired-brian-link",
      expiresAt: dateAt(-5, 23, 59),
      isActive: false,
    },
  ]);

  await MeetingRequest.create([
    {
      requesterId: sarah._id,
      ownerId: alice._id,
      topic: "COMP 307 project planning",
      message: "I want feedback on our milestone breakdown before Friday.",
      preferredStart: dateAt(2, 11, 0),
      preferredEnd: dateAt(2, 11, 30),
      status: "PENDING",
    },
    {
      requesterId: daniel._id,
      ownerId: brian._id,
      topic: "Research direction meeting",
      message: "Can we review my experiment design and next steps?",
      preferredStart: dateAt(4, 15, 0),
      preferredEnd: dateAt(4, 15, 45),
      status: "ACCEPTED",
    },
    {
      requesterId: maya._id,
      ownerId: alice._id,
      topic: "Missed assignment discussion",
      message: "Looking for advice on how to catch up after being sick.",
      preferredStart: dateAt(6, 13, 0),
      preferredEnd: dateAt(6, 13, 30),
      status: "DECLINED",
    },
  ]);

  const oneOnOneStart = dateAt(3, 13, 0);
  const workshopStart = dateAt(7, 15, 0);
  const pollWinnerStart = dateAt(10, 11, 0);

  const bookings = await Booking.create([
    {
      ownerId: alice._id,
      title: "Sarah Project Review",
      description: "Private appointment to review sprint scope and risks.",
      startTime: oneOnOneStart,
      endTime: addMinutes(oneOnOneStart, 30),
      visibility: "private",
      status: "reserved",
      participants: [sarah._id],
      capacity: 1,
    },
    {
      ownerId: brian._id,
      title: "Graduate Writing Workshop",
      description: "Public workshop for thesis writing structure and feedback.",
      startTime: workshopStart,
      endTime: addMinutes(workshopStart, 60),
      visibility: "public",
      status: "reserved",
      participants: [daniel._id, maya._id],
      capacity: 3,
    },
    {
      ownerId: brian._id,
      title: "Finalized Poll Session",
      description: "Generated from the scheduling poll after votes were collected.",
      startTime: pollWinnerStart,
      endTime: addMinutes(pollWinnerStart, 45),
      visibility: "public",
      status: "reserved",
      participants: [daniel._id, omar._id],
      capacity: 4,
    },
    {
      ownerId: alice._id,
      title: "Open Advising Appointment",
      description: "Still open for students to reserve.",
      startTime: dateAt(8, 9, 30),
      endTime: dateAt(8, 10, 0),
      visibility: "public",
      status: "open",
      participants: [],
      capacity: 1,
    },
  ]);

  const [sarahReviewBooking, workshopBooking, finalizedPollBooking] = bookings;

  await BookingRequest.create([
    {
      ownerId: alice._id,
      requesterId: sarah._id,
      message: "Could we meet to go over our demo plan?",
      status: "accepted",
      proposedTitle: "Sarah Demo Plan Review",
      proposedDescription: "Review project demo flow, rubric, and open issues.",
      createdBookingId: sarahReviewBooking._id,
    },
    {
      ownerId: brian._id,
      requesterId: omar._id,
      message: "I need help choosing between two project directions.",
      status: "pending",
      proposedTitle: "Project Direction Advice",
      proposedDescription: "Talk through tradeoffs between systems ideas.",
      createdBookingId: null,
    },
    {
      ownerId: alice._id,
      requesterId: maya._id,
      message: "Can we review the assignment after the deadline?",
      status: "declined",
      proposedTitle: "Late Assignment Review",
      proposedDescription: "Discuss recovery options and expectations.",
      createdBookingId: null,
    },
  ]);

  const calendarPollSlotOneStart = dateAt(10, 11, 0);
  const calendarPollSlotTwoStart = dateAt(10, 14, 0);
  const heatmapStart = dateAt(12, 8, 0);

  await BookingPoll.create([
    {
      ownerId: brian._id,
      title: "Capstone Sync Poll",
      description: "Pick the best time for next week's capstone check-in.",
      invitedUsers: [daniel._id, omar._id, maya._id],
      method: "calendar",
      candidateSlots: [
        {
          startTime: calendarPollSlotOneStart,
          endTime: addMinutes(calendarPollSlotOneStart, 45),
          selectedByUsers: [daniel._id, omar._id],
        },
        {
          startTime: calendarPollSlotTwoStart,
          endTime: addMinutes(calendarPollSlotTwoStart, 45),
          selectedByUsers: [maya._id],
        },
      ],
      rangeStart: null,
      rangeEnd: null,
      status: "finalized",
      finalSelection: {
        startTime: calendarPollSlotOneStart,
        endTime: addMinutes(calendarPollSlotOneStart, 45),
      },
      recurrence: null,
      createdBookingIds: [finalizedPollBooking._id],
    },
    {
      ownerId: alice._id,
      title: "Midterm Review Heatmap",
      description: "Collect availability before opening extra review sessions.",
      invitedUsers: [sarah._id, daniel._id, maya._id],
      method: "heatmap",
      candidateSlots: [
        {
          startTime: heatmapStart,
          endTime: addMinutes(heatmapStart, 30),
          selectedByUsers: [sarah._id, maya._id],
        },
        {
          startTime: addMinutes(heatmapStart, 30),
          endTime: addMinutes(heatmapStart, 60),
          selectedByUsers: [daniel._id],
        },
        {
          startTime: addMinutes(heatmapStart, 60),
          endTime: addMinutes(heatmapStart, 90),
          selectedByUsers: [],
        },
      ],
      rangeStart: dateAt(12, 0, 0),
      rangeEnd: dateAt(14, 0, 0),
      status: "collectingVotes",
      finalSelection: {
        startTime: null,
        endTime: null,
      },
      recurrence: "Weekly during midterm prep",
      createdBookingIds: [],
    },
  ]);

  await GroupMeeting.create([
    {
      ownerId: alice._id,
      title: "Frontend Debugging Clinic",
      capacity: 4,
      startTime: dateAt(9, 17, 0),
      endTime: dateAt(9, 18, 0),
      attendeeIds: [sarah._id, maya._id],
    },
    {
      ownerId: brian._id,
      title: "Research Methods Roundtable",
      capacity: 5,
      startTime: dateAt(11, 10, 0),
      endTime: dateAt(11, 11, 30),
      attendeeIds: [daniel._id, omar._id, maya._id],
    },
  ]);

  console.log("Dummy data inserted successfully.");
  console.log(`Seed password for all users: ${seedPassword}`);
  console.log(
    JSON.stringify(
      {
        users: await User.countDocuments(),
        recurringSeries: await RecurringSeries.countDocuments(),
        slots: await Slot.countDocuments(),
        inviteLinks: await InviteLink.countDocuments(),
        meetingRequests: await MeetingRequest.countDocuments(),
        bookings: await Booking.countDocuments(),
        bookingRequests: await BookingRequest.countDocuments(),
        bookingPolls: await BookingPoll.countDocuments(),
        groupMeetings: await GroupMeeting.countDocuments(),
      },
      null,
      2,
    ),
  );
}

seedDatabase()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
