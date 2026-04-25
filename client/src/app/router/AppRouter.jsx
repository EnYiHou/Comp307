import { Navigate, Route, Routes } from "react-router-dom";
import DashboardShell from "../../components/layout/DashboardShell";
import PublicShell from "../../components/layout/PublicShell";
import MyAppointmentsPage from "../../pages/dashboard/MyAppointmentsPage";
import BookAppointmentPage from "../../pages/dashboard/BookAppointmentPage";
import RequestMeetingPage from "../../pages/dashboard/RequestMeetingPage";
import SettingsPage from "../../pages/dashboard/SettingsPage";
import UserDashboardPage from "../../pages/dashboard/UserDashboardPage";
import BookingRequestsPage from "../../pages/owner/BookingRequestsPage";
import CreateSlotPage from "../../pages/owner/CreateSlotPage";
import GroupMeetingSetupPage from "../../pages/owner/GroupMeetingSetupPage";
import InviteLinksPage from "../../pages/owner/InviteLinksPage";
import ManageSlotsPage from "../../pages/owner/ManageSlotsPage";
import OwnerDashboardPage from "../../pages/owner/OwnerDashboardPage";
import RecurringOfficeHoursPage from "../../pages/owner/RecurringOfficeHoursPage";
import ViewBookingsPage from "../../pages/owner/ViewBookingsPage";
import AuthPage from "../../pages/public/AuthPage";
import InstructionsPage from "../../pages/public/InstructionsPage";
import LandingPage from "../../pages/public/LandingPage";
import OwnerPublicSlotsPage from "../../pages/public/OwnerPublicSlotsPage";
import OwnersDirectoryPage from "../../pages/public/OwnersDirectoryPage";
import ProtectedRoute from "./ProtectedRoute";
import TeamFinder from "../../pages/tinder/TeamFinder";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/login"
        element={<Navigate to="/auth?mode=login" replace />}
      />
      <Route
        path="/register"
        element={<Navigate to="/auth?mode=signup" replace />}
      />

      <Route element={<PublicShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/owners" element={<OwnersDirectoryPage />} />
        <Route path="/owners/:ownerId" element={<OwnerPublicSlotsPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/dashboard-owners" element={<OwnersDirectoryPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route
            path="/dashboard/appointments"
            element={<MyAppointmentsPage />}
          />
          <Route path="/dashboard/book" element={<BookAppointmentPage />} />
          <Route
            path="/dashboard/request-meeting"
            element={<RequestMeetingPage />}
          />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="/owner/slots" element={<ManageSlotsPage />} />
          <Route path="/owner/slots/new" element={<CreateSlotPage />} />
          <Route
            path="/owner/recurring-office-hours"
            element={<RecurringOfficeHoursPage />}
          />
          <Route path="/owner/requests" element={<BookingRequestsPage />} />
          <Route
            path="/owner/group-meetings/new"
            element={<GroupMeetingSetupPage />}
          />
          <Route path="/owner/bookings" element={<ViewBookingsPage />} />
          <Route path="/owner/invite-links" element={<InviteLinksPage />} />

          <Route path="/tinder" element={<TeamFinder />} />
          <Route path="/tinder/:teamId" element={<TeamFinder />} />
        </Route>
      </Route>
    </Routes>
  );
}
