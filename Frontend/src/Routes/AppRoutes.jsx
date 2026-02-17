import { Routes, Route, Navigate } from "react-router-dom";

import CandidateLogin from "../Pages/Candidate/CandidateLogin";
import CandidateRegister from "../Pages/Candidate/CandidateRegister";
import CandidateDashboard from "../Pages/Candidate/CandidateDashboard";
import ApplicationForm from "../Pages/Candidate/Applicationform";
import NotFound from "../Pages/Common/NotFound";
// import ProtectedRoute from "./ProtectedRoute"; 
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import DriveManagement from "../Pages/Admin/DriveManagement";
import CreateJob from "../Pages/Admin/CreateJob";
import CreateUsers from "../Pages/Admin/CreateUsers";
import CreatePanelist from "../Pages/Admin/CreatePanelist";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<CandidateLogin />} />
      <Route path="/register" element={<CandidateRegister />} />

      {/* Candidate routes */}
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

      {/* Panelist routes */}

      {/* Admin */}
      <Route path="/Admin/dashboard/Create-Users" element={<CreateUsers />} />
      <Route path="/Admin/dashboard" element={<AdminDashboard />} />
      <Route
        path="/Admin/dashboard/Manage-Panelists"
        element={<CreatePanelist />}
      />
       <Route path="/Admin/dashboard/Drives" element={<DriveManagement />} />
       <Route path="/Admin/dashboard/Create-Job" element={<CreateJob/>}/>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
