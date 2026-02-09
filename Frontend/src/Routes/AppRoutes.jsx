import { Routes, Route, Navigate } from "react-router-dom";

import CandidateLogin from "../Pages/Candidate/CandidateLogin";
import CandidateRegister from "../Pages/Candidate/CandidateRegister";
import CandidateDashboard from "../Pages/Candidate/CandidateDashboard";
import HRDashboard from "../Pages/HR/HRDashboard";
import ApplicationForm from "../Pages/Candidate/Applicationform";
import NotFound from "../Pages/Common/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../Pages/Admin/AdminDashboard";

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
          <ProtectedRoute>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/candidate/application" element={
        <ProtectedRoute>
        <ApplicationForm/>
        </ProtectedRoute>
        } />
        

      {/* HR routes */}
      <Route path="/hr/dashboard" element={<HRDashboard />} />

      {/* Panelist routes */}


      {/* Admi */}
      <Route path="/Admin/dashboard" element={<AdminDashboard/>} />


      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
