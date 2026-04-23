import { Route, Routes } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
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
import InstructionsPage from "../../pages/public/InstructionsPage";
import LandingPage from "../../pages/public/LandingPage";
import LoginPage from "../../pages/public/LoginPage";
import OwnerPublicSlotsPage from "../../pages/public/OwnerPublicSlotsPage";
import OwnersDirectoryPage from "../../pages/public/OwnersDirectoryPage";
import RegisterPage from "../../pages/public/RegisterPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/owners" element={<OwnersDirectoryPage />} />
        <Route path="/owners/:ownerId" element={<OwnerPublicSlotsPage />} />
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/dashboard/appointments" element={<MyAppointmentsPage />} />
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
      </Route>
    </Routes>
  );
}
