import { Routes, Route, Navigate } from "react-router-dom";

import CandidateLogin from "../Pages/Candidate/CandidateLogin";
import CandidateRegister from "../Pages/Candidate/CandidateRegister";
import CandidateDashboard from "../Pages/Candidate/CandidateDashboard";
import ApplicationForm from "../Pages/Candidate/Applicationform";
import NotFound from "../Pages/Common/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import CreateJob from "../Pages/Admin/CreateJob";
import CreateUsers from "../Pages/Admin/CreateUsers"
import AdminLogin from "../Pages/Admin/AdminLogin";
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
        

      {/* Panelist routes */}


      {/* Admin */}
      <Route path="/Admin/dashboard" element={<AdminDashboard/>} />
      <Route  path="/Admin/dashboard/Create-Jobs" element={<CreateJob/>}/>
      <Route  path="/Admin/dashboard/Create-Users" element={<CreateUsers/>}/>
      <Route path="/Admin/Login" element={<AdminLogin/>}/>
       <Route path="/Admin/dashboard/Manage-Panelists" element={<CreatePanelist />} />  


      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
