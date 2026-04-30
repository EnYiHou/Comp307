
import cors from "cors";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import groupMeetingRoutes from "./routes/groupMeetingRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import meetingRequestRoutes from "./routes/meetingRequestRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from './routes/dashboardRoutes.js'
import teamRoutes from './routes/teamRoutes.js';

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../../client/dist");

const app = express();

app.use(
  cors({
    origin: [
      env.clientUrl,
      "http://127.0.0.1:3001",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser())
app.use(morgan("dev"));

app.use(express.static(clientDistPath));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/meeting-requests", meetingRequestRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/group-meetings", groupMeetingRoutes);
app.use("/api/calendar", calendarRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use("/api/teams", teamRoutes);

app.get("{*path}", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Fallback error handler
app.use(errorMiddleware);

export default app;
