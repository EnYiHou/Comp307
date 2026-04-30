import { Navigate, Route, Routes } from "react-router-dom";
import DashboardShell from "../../components/layout/DashboardShell";
import PublicShell from "../../components/layout/PublicShell";
import BookAppointmentPage from "../../pages/dashboard/BookAppointmentPage";
import UserDashboardPage from "../../pages/dashboard/UserDashboardPage";
import CreateSlotPage from "../../pages/owner/CreateSlotPage";
import GroupMeetingSetupPage from "../../pages/owner/GroupMeetingSetupPage";
import OwnerDashboardPage from "../../pages/owner/OwnerDashboardPage";
import AuthPage from "../../pages/public/AuthPage";
import LandingPage from "../../pages/public/LandingPage";
import OwnersDirectoryPage from "../../pages/dashboard/OwnersDirectoryPage";
import OwnerProfilePage from "../../pages/dashboard/OwnerProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import TeamFinder from "../../pages/tinder/TeamFinder";

// Everyone added their own routes here

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
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/dashboard-owners" element={<OwnersDirectoryPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/dashboard/book" element={<BookAppointmentPage />} />
          <Route path="/owners" element={<OwnersDirectoryPage />} />
          <Route path="/owners/:ownerId" element={<OwnerProfilePage />} />

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["OWNER"]}
                redirectTo="/dashboard"
              />
            }
          >
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/slots/new" element={<CreateSlotPage />} />
            <Route
              path="/owner/group-meetings/new"
              element={<GroupMeetingSetupPage />}
            />
          </Route>

          <Route path="/tinder" element={<TeamFinder />} />
          <Route path="/tinder/:teamId" element={<TeamFinder />} />
        </Route>
      </Route>
    </Routes>
  );
}
