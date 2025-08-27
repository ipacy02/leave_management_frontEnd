import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserLeaveBalances, 
  fetchUserLeaveRequests, 
  getLeaveRequestById,
  selectLeave
} from '../redux/features/leaveFeature';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const LeaveBalanceCard = ({ leaveBalance }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-2">{leaveBalance.leaveTypeName}</h3>
      <div className="flex-1 flex flex-col justify-between">
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600">Available</span>
            <span className="font-medium">{leaveBalance.availableDays} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-700 h-2 rounded-full" 
              style={{ width: `${(leaveBalance.availableDays / leaveBalance.totalDays) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Total</span>
            <p className="font-medium">{leaveBalance.totalDays} days</p>
          </div>
          <div>
            <span className="text-gray-500">Used</span>
            <p className="font-medium">{leaveBalance.usedDays} days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeaveRequestCard = ({ request, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => onClick(request.id)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{request.leaveTypeName}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>
      <div className="mt-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500 text-sm">From</span>
            <p className="font-medium">{formatDate(request.startDate)}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">To</span>
            <p className="font-medium">{formatDate(request.endDate)}</p>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-gray-500 text-sm">Duration</span>
          <p className="font-medium">{request.days} days</p>
        </div>
        {request.reason && (
          <div className="mt-2">
            <span className="text-gray-500 text-sm">Reason</span>
            <p className="text-sm line-clamp-2">{request.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LeaveRequestDetail = ({ request, onBack }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Leave Request Details</h2>
        <button 
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{request.leaveTypeName}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-gray-500">Start Date</span>
          <p className="font-medium">{formatDate(request.startDate)}</p>
        </div>
        <div>
          <span className="text-gray-500">End Date</span>
          <p className="font-medium">{formatDate(request.endDate)}</p>
        </div>
        <div>
          <span className="text-gray-500">Duration</span>
          <p className="font-medium">{request.days} days</p>
        </div>
        <div>
          <span className="text-gray-500">Requested On</span>
          <p className="font-medium">{formatDate(request.createdAt)}</p>
        </div>
      </div>

      {request.reason && (
        <div className="mb-6">
          <span className="text-gray-500">Reason</span>
          <p className="mt-1 p-3 bg-gray-50 rounded-md">{request.reason}</p>
        </div>
      )}

      {request.comments && (
        <div className="mb-6">
          <span className="text-gray-500">Manager Comments</span>
          <p className="mt-1 p-3 bg-gray-50 rounded-md">{request.comments}</p>
        </div>
      )}

      {request.documents && request.documents.length > 0 && (
        <div>
          <span className="text-gray-500">Supporting Documents</span>
          <div className="mt-2 space-y-2">
            {request.documents.map((doc) => (
              <div key={doc.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {doc.fileName}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LeaveDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { leaveBalances, leaveRequests, currentLeaveRequest, loading, error, isAuthenticated } = useSelector(selectLeave);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [activeTab, setActiveTab] = useState('balances');

  useEffect(() => {
    dispatch(fetchUserLeaveBalances());
    dispatch(fetchUserLeaveRequests());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRequestId) {
      dispatch(getLeaveRequestById(selectedRequestId));
    }
  }, [selectedRequestId, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
      });
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Successfully loaded leave data!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '👋',
      });
    }
  }, [isAuthenticated]);

  const handleViewRequest = (requestId) => {
    setSelectedRequestId(requestId);
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
  };

  const handleApplyForLeave = () => {
    navigate('/dashboard/apply-leave');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {selectedRequestId && currentLeaveRequest ? (
        <LeaveRequestDetail 
          request={currentLeaveRequest} 
          onBack={handleBackToList} 
        />
      ) : (
        <>
          <div className="mb-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex">
                <button
                  className={`py-2 px-4 mr-2 border-b-2 font-medium text-sm ${
                    activeTab === 'balances'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('balances')}
                >
                  Leave Balances
                </button>
                <button
                  className={`py-2 px-4 mr-2 border-b-2 font-medium text-sm ${
                    activeTab === 'requests'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('requests')}
                >
                  Leave Requests
                </button>
              </div>
              <button
                onClick={handleApplyForLeave}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:border-indigo-700 focus:ring focus:ring-indigo-200 active:bg-indigo-700 transition ease-in-out duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Apply for Leave
              </button>
            </div>
          </div>

          {activeTab === 'balances' && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Leave Balances</h2>
              {leaveBalances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {leaveBalances.map((balance) => (
                    <LeaveBalanceCard key={balance.id} leaveBalance={balance} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
                  <p className="text-gray-600">No leave balances available.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Leave Requests</h2>
              {leaveRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leaveRequests.map((request) => (
                    <LeaveRequestCard 
                      key={request.id} 
                      request={request} 
                      onClick={handleViewRequest} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No leave requests found.</p>
                  <button
                    onClick={handleApplyForLeave}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:border-indigo-700 focus:ring focus:ring-indigo-200 active:bg-indigo-700 transition"
                  >
                    Apply for your first leave
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LeaveDashboard;