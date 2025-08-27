import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/features/authSlice';
import { useNavigate, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProfilePage from '../pages/ProfilePage';
import DepartmentsList from "../components/DepartmentsList.jsx";
import UsersPage from "../pages/UsersPage.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import LeaveDashboard from "../pages/LeaveDashboardAllusers.jsx";
import LeaveApplicationForm from "../components/leave/LeaveApplicationForm.jsx";
import  LeaveApprovalDashboard from "../pages/LeaveApprovalDashboard.jsx";
import  ManagersDisplay from "../pages/ManagersDisplay.jsx";
import ManagerTeamView  from "../components/common/ManagerTeamView.jsx";
import NotificationsPage from "../components/Notifications/NotificationsPage.jsx";
import ReportsDashboard from "../pages/ReportsDashboard.jsx";
import ReportWidget from "../components/reports/ReportWidget.jsx";
import LeaveTypeManagement from "../components/leave/LeaveTypeManagement.jsx";
import ExportReports from "../components/reports/ExportReports.jsx"

// Dashboard Home Content Component
const DashboardHome = () => (
  <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome to your AfriHR dashboard. You are successfully logged in!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
       
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-700 mb-3"></h2>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          {/* Activity feed will be populated with real data from API */}
        </div>
      </div>
    </div>
  </div>
);



// Settings Component (for Admins)
const Settings = () => (
  <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h1>
      <p className="text-gray-600">Configure system settings and preferences.</p>
      {/* Settings content will be loaded from API */}
    </div>
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={< ReportsDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="leave-calendar" element={<CalendarPage />} />
        <Route path="my-applications" element={<LeaveDashboard />} />
        <Route path="apply-leave" element={<LeaveApplicationForm />} />
        <Route path="team-overview" element={<ManagerTeamView  />} />
        <Route path="approvals" element={<LeaveApprovalDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="departments" element={<DepartmentsList />} />
        <Route path="reports" element={< ExportReports />} />
        <Route path="Notifications" element={<NotificationsPage />} />
        <Route path="leavemanagement" element={<LeaveTypeManagement />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;