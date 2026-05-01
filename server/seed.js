import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { Booking, BookingPoll } from "./src/models/Booking.js";
import MeetingRequest from "./src/models/MeetingRequest.js";
import Team from "./src/models/Team.js";
import User from "./src/models/User.js";

//This files populates the database. Not part of the website itself

const DEMO_PASSWORD = "SeedPass123!";
const OWNER_LOGIN_EMAIL = "sophie.chen@mcgill.ca";
const USER_LOGIN_EMAIL = "alex.kim@mail.mcgill.ca";
const SEEDED_USER_EMAILS = [
  OWNER_LOGIN_EMAIL,
  "marcus.brown@mcgill.ca",
  "nina.patel@mcgill.ca",
  USER_LOGIN_EMAIL,
  "maya.roy@mail.mcgill.ca",
  "liam.ng@mail.mcgill.ca",
  "emma.ross@mail.mcgill.ca",
  "noah.singh@mail.mcgill.ca",
];
const SEEDED_BOOKING_TITLES = [
  "Open Office Hours: React Router",
  "Project Demo Dry Runs",
  "Algorithms Help Desk",
  "Graduate School Q&A",
  "Database Design Clinic",
  "Presentation Rehearsal Slots",
  "Authentication Flow Review",
  "Research Plan Feedback",
  "Calendar Accessibility Review",
  "Schema Walkthrough",
  "Finalized COMP 307 Demo Rehearsal",
];
const SEEDED_MEETING_REQUEST_TOPICS = [
  "Final Project Architecture Review",
  "Accessibility Pass For Calendar View",
  "Deployment Issue Triage",
  "Authentication Flow Review",
  "Research Plan Feedback",
  "Late Policy Clarification",
  "Cancelled Sprint Retro Discussion",
  "Calendar Accessibility Review",
];
const SEEDED_POLL_TITLES = [
  "COMP 307 Project Checkpoint Poll",
  "Demo Week Availability Heatmap",
  "Finalized COMP 307 Demo Rehearsal",
  "COMP 251 Review Session Poll",
];
const SEEDED_TEAM_NAMES = [
  "BERK Booking App Polish",
  "Database Index Lab",
  "Distributed Systems Mock Demo",
  "Frontend Accessibility Studio",
];

function dateAt(daysFromToday, hour, minute = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addWeeks(date, weeks) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + weeks * 7);
  return nextDate;
}

function slot(daysFromToday, hour, minute, durationMinutes, selectedByUsers = []) {
  const startTime = dateAt(daysFromToday, hour, minute);
  return {
    startTime,
    endTime: addMinutes(startTime, durationMinutes),
    selectedByUsers,
  };
}

function generateHeatmapCandidates(rangeStart, rangeEnd, votedSlots = []) {
  const slotsMinutesInterval = 30;
  const dayHourStart = 6;
  const dayHourEnd = 18;
  const selectedUsersByStartTime = new Map(
    votedSlots.map(({ startTime, selectedByUsers }) => [
      startTime.getTime(),
      selectedByUsers,
    ]),
  );

  const slots = [];
  const startDate = new Date(rangeStart);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(rangeEnd);
  endDate.setHours(0, 0, 0, 0);

  const currentDay = new Date(startDate);

  while (currentDay <= endDate) {
    const daySlotStart = new Date(currentDay);
    daySlotStart.setHours(dayHourStart, 0, 0, 0);

    const daySlotEnd = new Date(currentDay);
    daySlotEnd.setHours(dayHourEnd, 0, 0, 0);

    let currentSlotStart = new Date(daySlotStart);
    while (currentSlotStart < daySlotEnd) {
      const currentSlotEnd = addMinutes(currentSlotStart, slotsMinutesInterval);
      slots.push({
        startTime: new Date(currentSlotStart),
        endTime: currentSlotEnd,
        selectedByUsers: selectedUsersByStartTime.get(currentSlotStart.getTime()) ?? [],
      });
      currentSlotStart = currentSlotEnd;
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return slots;
}

function pick(usersByEmail, email) {
  const user = usersByEmail[email];
  if (!user) {
    throw new Error(`Seed user not found for ${email}`);
  }
  return user;
}

async function createUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = await User.insertMany([
    {
      name: "Dr. Sophie Chen",
      email: OWNER_LOGIN_EMAIL,
      passwordHash,
      role: "OWNER",
    },
    {
      name: "Prof. Marcus Brown",
      email: "marcus.brown@mcgill.ca",
      passwordHash,
      role: "OWNER",
    },
    {
      name: "Dr. Nina Patel",
      email: "nina.patel@mcgill.ca",
      passwordHash,
      role: "OWNER",
    },
    {
      name: "Alex Kim",
      email: USER_LOGIN_EMAIL,
      passwordHash,
      role: "USER",
    },
    {
      name: "Maya Roy",
      email: "maya.roy@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
    {
      name: "Liam Ng",
      email: "liam.ng@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
    {
      name: "Emma Ross",
      email: "emma.ross@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
    {
      name: "Noah Singh",
      email: "noah.singh@mail.mcgill.ca",
      passwordHash,
      role: "USER",
    },
  ]);

  return Object.fromEntries(users.map((user) => [user.email, user]));
}

async function createBookings(usersByEmail) {
  const sophie = pick(usersByEmail, OWNER_LOGIN_EMAIL);
  const marcus = pick(usersByEmail, "marcus.brown@mcgill.ca");
  const nina = pick(usersByEmail, "nina.patel@mcgill.ca");
  const alex = pick(usersByEmail, USER_LOGIN_EMAIL);
  const maya = pick(usersByEmail, "maya.roy@mail.mcgill.ca");
  const liam = pick(usersByEmail, "liam.ng@mail.mcgill.ca");
  const emma = pick(usersByEmail, "emma.ross@mail.mcgill.ca");
  const noah = pick(usersByEmail, "noah.singh@mail.mcgill.ca");

  const alexSophieStart = dateAt(3, 15);
  const alexMarcusStart = dateAt(4, 11);
  const emmaSophieStart = dateAt(3, 14);

  const regularBookings = await Booking.insertMany([
    {
      ownerId: sophie._id,
      title: "Open Office Hours: React Router",
      description: "Drop in for routing, protected pages, and dashboard flow questions.",
      startTime: dateAt(1, 9),
      endTime: dateAt(1, 10),
      visibility: "public",
      status: "open",
      participants: [],
      capacity: 2,
    },
    {
      ownerId: sophie._id,
      title: "Project Demo Dry Runs",
      description: "Short practice runs before the final COMP 307 demo.",
      startTime: dateAt(2, 13),
      endTime: dateAt(2, 14),
      visibility: "public",
      status: "open",
      participants: [noah._id],
      capacity: 3,
    },
    {
      ownerId: marcus._id,
      title: "Algorithms Help Desk",
      description: "One-on-one help with graph traversal and dynamic programming review.",
      startTime: dateAt(1, 11),
      endTime: dateAt(1, 12),
      visibility: "public",
      status: "open",
      participants: [],
      capacity: 2,
    },
    {
      ownerId: marcus._id,
      title: "Graduate School Q&A",
      description: "Open slot for research statements and graduate school questions.",
      startTime: dateAt(5, 14),
      endTime: dateAt(5, 15),
      visibility: "public",
      status: "open",
      participants: [],
      capacity: 1,
    },
    {
      ownerId: nina._id,
      title: "Database Design Clinic",
      description: "Review schema tradeoffs, indexes, and relationships.",
      startTime: dateAt(2, 10),
      endTime: dateAt(2, 11),
      visibility: "public",
      status: "open",
      participants: [],
      capacity: 2,
    },
    {
      ownerId: nina._id,
      title: "Presentation Rehearsal Slots",
      description: "Practice a five-minute project explanation with quick feedback.",
      startTime: dateAt(4, 16),
      endTime: dateAt(4, 17),
      visibility: "public",
      status: "open",
      participants: [emma._id],
      capacity: 3,
    },
    {
      ownerId: sophie._id,
      title: "Authentication Flow Review",
      description: "Accepted custom request from Alex about login, cookies, and roles.",
      startTime: alexSophieStart,
      endTime: addMinutes(alexSophieStart, 60),
      visibility: "private",
      status: "reserved",
      participants: [alex._id],
      capacity: 1,
    },
    {
      ownerId: marcus._id,
      title: "Research Plan Feedback",
      description: "Accepted custom request from Alex about narrowing the project pitch.",
      startTime: alexMarcusStart,
      endTime: addMinutes(alexMarcusStart, 60),
      visibility: "private",
      status: "reserved",
      participants: [alex._id],
      capacity: 1,
    },
    {
      ownerId: sophie._id,
      title: "Calendar Accessibility Review",
      description: "Accepted custom request from Emma for keyboard and contrast feedback.",
      startTime: emmaSophieStart,
      endTime: addMinutes(emmaSophieStart, 60),
      visibility: "private",
      status: "reserved",
      participants: [emma._id],
      capacity: 1,
    },
    {
      ownerId: nina._id,
      title: "Schema Walkthrough",
      description: "Confirmed group appointment for reviewing model relationships.",
      startTime: dateAt(6, 10),
      endTime: dateAt(6, 11),
      visibility: "public",
      status: "reserved",
      participants: [noah._id, liam._id],
      capacity: 2,
    },
  ]);

  const finalizedStart = dateAt(11, 12);
  const finalizedPollBookings = await Booking.insertMany(
    [0, 1].map((weekOffset) => ({
      ownerId: sophie._id,
      title: "Finalized COMP 307 Demo Rehearsal",
      description: "Created from a finalized group poll for the project demo team.",
      startTime: addWeeks(finalizedStart, weekOffset),
      endTime: addWeeks(addMinutes(finalizedStart, 60), weekOffset),
      visibility: "public",
      status: "reserved",
      participants: [alex._id, maya._id, liam._id, emma._id],
      capacity: 4,
    })),
  );

  return {
    regularBookings,
    finalizedPollBookings,
    acceptedRequestTimes: {
      alexSophieStart,
      alexMarcusStart,
      emmaSophieStart,
    },
  };
}

async function createMeetingRequests(usersByEmail, acceptedRequestTimes) {
  const sophie = pick(usersByEmail, OWNER_LOGIN_EMAIL);
  const marcus = pick(usersByEmail, "marcus.brown@mcgill.ca");
  const nina = pick(usersByEmail, "nina.patel@mcgill.ca");
  const alex = pick(usersByEmail, USER_LOGIN_EMAIL);
  const maya = pick(usersByEmail, "maya.roy@mail.mcgill.ca");
  const liam = pick(usersByEmail, "liam.ng@mail.mcgill.ca");
  const emma = pick(usersByEmail, "emma.ross@mail.mcgill.ca");

  const alexPendingStart = dateAt(1, 10, 30);
  const mayaPendingStart = dateAt(1, 13, 30);
  const liamPendingStart = dateAt(2, 9, 30);
  const declinedStart = dateAt(5, 10);
  const cancelledStart = dateAt(6, 16);

  return MeetingRequest.insertMany([
    {
      requesterId: alex._id,
      ownerId: sophie._id,
      topic: "Final Project Architecture Review",
      message: "Can we review the route structure and model relationships before demo day?",
      preferredStart: alexPendingStart,
      preferredEnd: addMinutes(alexPendingStart, 60),
      status: "PENDING",
    },
    {
      requesterId: maya._id,
      ownerId: sophie._id,
      topic: "Accessibility Pass For Calendar View",
      message: "I would like feedback on keyboard interaction and contrast for the booking calendar.",
      preferredStart: mayaPendingStart,
      preferredEnd: addMinutes(mayaPendingStart, 45),
      status: "PENDING",
    },
    {
      requesterId: liam._id,
      ownerId: sophie._id,
      topic: "Deployment Issue Triage",
      message: "Our server starts locally but fails after setting production environment variables.",
      preferredStart: liamPendingStart,
      preferredEnd: addMinutes(liamPendingStart, 45),
      status: "PENDING",
    },
    {
      requesterId: alex._id,
      ownerId: sophie._id,
      topic: "Authentication Flow Review",
      message: "Accepted request for reviewing login, cookies, and role redirects.",
      preferredStart: acceptedRequestTimes.alexSophieStart,
      preferredEnd: addMinutes(acceptedRequestTimes.alexSophieStart, 60),
      status: "ACCEPTED",
    },
    {
      requesterId: alex._id,
      ownerId: marcus._id,
      topic: "Research Plan Feedback",
      message: "Accepted request for narrowing the final presentation pitch.",
      preferredStart: acceptedRequestTimes.alexMarcusStart,
      preferredEnd: addMinutes(acceptedRequestTimes.alexMarcusStart, 60),
      status: "ACCEPTED",
    },
    {
      requesterId: alex._id,
      ownerId: nina._id,
      topic: "Late Policy Clarification",
      message: "Declined example request so the student dashboard shows a past decision.",
      preferredStart: declinedStart,
      preferredEnd: addMinutes(declinedStart, 60),
      status: "DECLINED",
    },
    {
      requesterId: alex._id,
      ownerId: sophie._id,
      topic: "Cancelled Sprint Retro Discussion",
      message: "Cancelled by the student after finding an answer in the project notes.",
      preferredStart: cancelledStart,
      preferredEnd: addMinutes(cancelledStart, 60),
      status: "CANCELLED",
    },
    {
      requesterId: emma._id,
      ownerId: sophie._id,
      topic: "Calendar Accessibility Review",
      message: "Accepted request connected to the private accessibility review booking.",
      preferredStart: acceptedRequestTimes.emmaSophieStart,
      preferredEnd: addMinutes(acceptedRequestTimes.emmaSophieStart, 60),
      status: "ACCEPTED",
    },
  ]);
}

async function createBookingPolls(usersByEmail, finalizedPollBookings) {
  const sophie = pick(usersByEmail, OWNER_LOGIN_EMAIL);
  const marcus = pick(usersByEmail, "marcus.brown@mcgill.ca");
  const alex = pick(usersByEmail, USER_LOGIN_EMAIL);
  const maya = pick(usersByEmail, "maya.roy@mail.mcgill.ca");
  const liam = pick(usersByEmail, "liam.ng@mail.mcgill.ca");
  const emma = pick(usersByEmail, "emma.ross@mail.mcgill.ca");
  const noah = pick(usersByEmail, "noah.singh@mail.mcgill.ca");

  const calendarInvitees = [alex._id, maya._id, liam._id, emma._id, noah._id];
  const heatmapInvitees = [alex._id, maya._id, liam._id, emma._id, noah._id];
  const heatmapRangeStart = dateAt(7, 0);
  const heatmapRangeEnd = dateAt(9, 0);
  const heatmapCandidateSlots = generateHeatmapCandidates(heatmapRangeStart, heatmapRangeEnd, [
    {
      startTime: dateAt(7, 9, 0),
      selectedByUsers: [alex._id, maya._id, liam._id, emma._id],
    },
    {
      startTime: dateAt(7, 9, 30),
      selectedByUsers: [alex._id, liam._id, noah._id],
    },
    {
      startTime: dateAt(7, 10, 0),
      selectedByUsers: [emma._id],
    },
    {
      startTime: dateAt(8, 14, 0),
      selectedByUsers: [alex._id, maya._id, noah._id],
    },
    {
      startTime: dateAt(8, 15, 0),
      selectedByUsers: [liam._id],
    },
  ]);
  const finalizedStart = dateAt(11, 12);

  return BookingPoll.insertMany([
    {
      ownerId: sophie._id,
      title: "COMP 307 Project Checkpoint Poll",
      description: "Pick the best checkpoint time for reviewing project progress.",
      invitedUsers: calendarInvitees,
      method: "calendar",
      candidateSlots: [
        slot(3, 9, 0, 60, [alex._id, maya._id, liam._id, emma._id]),
        slot(3, 13, 0, 60, [alex._id, liam._id, noah._id]),
        slot(4, 10, 0, 60, [maya._id]),
        slot(4, 15, 0, 60, []),
      ],
      rangeStart: null,
      rangeEnd: null,
      status: "collectingVotes",
      recurrenceCount: 1,
    },
    {
      ownerId: sophie._id,
      title: "Demo Week Availability Heatmap",
      description: "Mark 30-minute blocks that work for a longer demo rehearsal.",
      invitedUsers: heatmapInvitees,
      method: "heatmap",
      candidateSlots: heatmapCandidateSlots,
      rangeStart: heatmapRangeStart,
      rangeEnd: heatmapRangeEnd,
      status: "collectingVotes",
      recurrenceCount: 1,
    },
    {
      ownerId: sophie._id,
      title: "Finalized COMP 307 Demo Rehearsal",
      description: "Already finalized poll that created recurring rehearsal bookings.",
      invitedUsers: [alex._id, maya._id, liam._id, emma._id],
      method: "calendar",
      candidateSlots: [
        {
          startTime: finalizedStart,
          endTime: addMinutes(finalizedStart, 60),
          selectedByUsers: [alex._id, maya._id, liam._id, emma._id],
        },
        slot(11, 15, 0, 60, [alex._id, liam._id]),
        slot(12, 10, 0, 60, [maya._id]),
      ],
      rangeStart: null,
      rangeEnd: null,
      status: "finalized",
      finalSelection: {
        startTime: finalizedStart,
        endTime: addMinutes(finalizedStart, 60),
      },
      recurrenceCount: 2,
      createdBookingIds: finalizedPollBookings.map((booking) => booking._id),
    },
    {
      ownerId: marcus._id,
      title: "COMP 251 Review Session Poll",
      description: "Secondary owner poll to show invites can come from other teachers.",
      invitedUsers: [alex._id, noah._id, liam._id],
      method: "calendar",
      candidateSlots: [
        slot(6, 13, 0, 60, [alex._id, noah._id]),
        slot(6, 16, 0, 60, [liam._id]),
        slot(7, 11, 0, 60, []),
      ],
      rangeStart: null,
      rangeEnd: null,
      status: "collectingVotes",
      recurrenceCount: 1,
    },
  ]);
}

async function createTeams(usersByEmail) {
  const alex = pick(usersByEmail, USER_LOGIN_EMAIL);
  const maya = pick(usersByEmail, "maya.roy@mail.mcgill.ca");
  const liam = pick(usersByEmail, "liam.ng@mail.mcgill.ca");
  const emma = pick(usersByEmail, "emma.ross@mail.mcgill.ca");
  const noah = pick(usersByEmail, "noah.singh@mail.mcgill.ca");

  return Team.insertMany([
    {
      name: "BERK Booking App Polish",
      course: "COMP 307",
      description: "Final polish team focused on auth, dashboards, and booking edge cases.",
      size: 5,
      leader: alex._id,
      members: [alex._id, maya._id, liam._id],
      applicants: [emma._id, noah._id],
    },
    {
      name: "Database Index Lab",
      course: "COMP 421",
      description: "Practice group for indexing, query plans, and schema normalization.",
      size: 4,
      leader: maya._id,
      members: [maya._id, emma._id],
      applicants: [alex._id],
    },
    {
      name: "Distributed Systems Mock Demo",
      course: "COMP 512",
      description: "Small group preparing demos about replication and fault tolerance.",
      size: 4,
      leader: noah._id,
      members: [noah._id, liam._id],
      applicants: [maya._id],
    },
    {
      name: "Frontend Accessibility Studio",
      course: "COMP 307",
      description: "Team for reviewing color contrast, keyboard navigation, and responsive layouts.",
      size: 3,
      leader: emma._id,
      members: [emma._id, noah._id],
      applicants: [alex._id, liam._id],
    },
  ]);
}

function printSummary({ users, bookings, meetingRequests, polls, teams }) {
  console.log("\nDatabase seeded successfully.");
  console.log(`Created ${users} users, ${bookings} bookings, ${meetingRequests} meeting requests, ${polls} booking polls, and ${teams} teams.`);
  console.log("\nOwner login:");
  console.log(`Email: ${OWNER_LOGIN_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("Owner data: pending meeting requests, upcoming bookings, active calendar poll, active heatmap poll, and finalized poll bookings.");
  console.log("\nUser login:");
  console.log(`Email: ${USER_LOGIN_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("User data: upcoming appointments, pending/accepted/declined/cancelled requests, voted invites, and team membership/discovery data.");
}

async function cleanupSeedData() {
  const [bookingResult, pollResult, requestResult, teamResult, userResult] = await Promise.all([
    Booking.deleteMany({ title: { $in: SEEDED_BOOKING_TITLES } }),
    BookingPoll.deleteMany({ title: { $in: SEEDED_POLL_TITLES } }),
    MeetingRequest.deleteMany({ topic: { $in: SEEDED_MEETING_REQUEST_TOPICS } }),
    Team.deleteMany({ name: { $in: SEEDED_TEAM_NAMES } }),
    User.deleteMany({ email: { $in: SEEDED_USER_EMAILS } }),
  ]);

  console.log("\nSeed cleanup complete.");
  console.log(`Deleted ${userResult.deletedCount} users.`);
  console.log(`Deleted ${bookingResult.deletedCount} bookings.`);
  console.log(`Deleted ${pollResult.deletedCount} booking polls.`);
  console.log(`Deleted ${requestResult.deletedCount} meeting requests.`);
  console.log(`Deleted ${teamResult.deletedCount} teams.`);
}

async function seedDatabase() {
  const usersByEmail = await createUsers();
  const { regularBookings, finalizedPollBookings, acceptedRequestTimes } =
    await createBookings(usersByEmail);
  const meetingRequests = await createMeetingRequests(usersByEmail, acceptedRequestTimes);
  const polls = await createBookingPolls(usersByEmail, finalizedPollBookings);
  const teams = await createTeams(usersByEmail);

  printSummary({
    users: Object.keys(usersByEmail).length,
    bookings: regularBookings.length + finalizedPollBookings.length,
    meetingRequests: meetingRequests.length,
    polls: polls.length,
    teams: teams.length,
  });
}

async function main() {
  await connectDB();

  if (process.argv.includes("--cleanup")) {
    await cleanupSeedData();
    return;
  }

  if (process.argv.includes("--reseed")) {
    await cleanupSeedData();
  }

  await seedDatabase();
}

main()
  .catch((error) => {
    console.error("\nSeed script failed.");
    console.error(error.message);

    if (error?.code === 11000) {
      console.error("A seeded email already exists. Run `node seed.js --cleanup` first, or use `node seed.js --reseed`.");
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
