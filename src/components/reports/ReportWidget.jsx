import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { BarChart2, Calendar, ChevronRight } from 'lucide-react';

import { fetchEmployeeStatistics } from '../../redux/features/ReportsSlice';
import { selectCurrentUser } from '../../redux/features/usersSlice';
import { selectReports } from '../../redux/features/ReportsSlice';

const ReportWidget = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const currentUser = useSelector(selectCurrentUser);
  const { statistics, loading } = useSelector(selectReports);
  
  // Set default date range to current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  useEffect(() => {
    if (currentUser?.id) {
      // Fetch current user's leave statistics for the current month
      dispatch(fetchEmployeeStatistics({
        userId: currentUser.id,
        startDate: format(firstDayOfMonth, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      }));
    }
  }, [currentUser]);
  
  // Navigate to full reports page
  const handleViewAllReports = () => {
    navigate('/reports');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <Calendar size={18} className="mr-2 text-indigo-600" />
          Leave Summary
        </h2>
        <span className="text-xs text-gray-500">
          {format(firstDayOfMonth, 'MMM d')} - {format(today, 'MMM d, yyyy')}
        </span>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : statistics ? (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-indigo-800 mb-1">Total Leave Requests</div>
              <div className="text-2xl font-semibold text-indigo-900">{statistics.totalRequests || 0}</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-purple-800 mb-1">Approved Requests</div>
              <div className="text-2xl font-semibold text-purple-900">{statistics.approvedRequests || 0}</div>
            </div>
          </div>
          
          {/* Leave Type Mini Chart */}
          {statistics.leaveTypeBreakdown && statistics.leaveTypeBreakdown.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Leave Type Breakdown</div>
              {statistics.leaveTypeBreakdown.slice(0, 3).map((item, index) => (
                <div key={index} className="mb-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.leaveTypeName}</span>
                    <span className="text-gray-800 font-medium">{item.totalDays} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, item.percentage)}%`, 
                        backgroundColor: index === 0 ? '#4f46e5' : index === 1 ? '#7e22ce' : '#1d4ed8' 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {statistics.leaveTypeBreakdown.length > 3 && (
                <div className="text-xs text-gray-500 mt-1">
                  +{statistics.leaveTypeBreakdown.length - 3} more types
                </div>
              )}
            </div>
          )}
          
          {/* Button to View Full Reports */}
          <button
            onClick={handleViewAllReports}
            className="w-full flex items-center justify-center py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md text-sm hover:opacity-90 transition-opacity"
          >
            View Detailed Reports
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <BarChart2 size={24} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No leave data available</p>
          <button
            onClick={handleViewAllReports}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Generate Reports
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportWidget;