import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../Pages/Common/LoginPage";
import CandidateRegister from "../Pages/Candidate/CandidateRegister";
import CandidateDashboard from "../Pages/Candidate/CandidateDashboard";
import ApplicationForm from "../Pages/Candidate/Applicationform";
import NotFound from "../Pages/Common/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import HRDashboard from "../Pages/HR/HRDashboard";
import DriveManagement from "../Pages/HR/DriveManagement";
import DrivePage from "../Pages/HR/DrivePage";
import CreateJob from "../Pages/HR/CreateJob";
import CreateUsers from "../Pages/HR/CreateUsers";
import CreatePanelist from "../Pages/HR/CreatePanelist";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<CandidateRegister />} />

      {/* Candidate routes */}
      <Route element={<ProtectedRoute storageKey="candidate_auth" redirectTo="/login" />}>
        <Route
          path="/candidate-dashboard"
          element={
              <CandidateDashboard />
          }
        />
        <Route
          path="/candidate/application"
          element={
              <ApplicationForm />
          }
        />
      </Route>

      {/* Panelist routes */}

      {/* HR */}
      <Route
        element={<ProtectedRoute storageKey="hr_auth" redirectTo="/login" />}
      >
        <Route path="/HR/dashboard/Create-Users" element={<CreateUsers />} />
        <Route path="/HR/dashboard" element={<HRDashboard />} />
        <Route
          path="/HR/dashboard/Manage-Panelists"
          element={<CreatePanelist />}
        />
        <Route path="/HR/dashboard/Drives" element={<DriveManagement />} />
        <Route path="/HR/dashboard/Drives/:driveId" element={<DrivePage />} />
        <Route path="/HR/dashboard/Create-Job" element={<CreateJob />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
