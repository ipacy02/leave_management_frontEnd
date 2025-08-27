import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import AdminDashboard from "../components/AdminDashboard.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import MicrosoftCallback from "../components/MicrosoftCallback.jsx";
import LeaveApplicationForm  from "../components/leave/LeaveApplicationForm.jsx"
 

const AllRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage  />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/api/v1/auth/microsoft/callback" element={<MicrosoftCallback />} />
      
      {/* Protected Routes - All dashboard routes are handled within AdminDashboard component */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback Route - redirect to landing page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AllRoutes;