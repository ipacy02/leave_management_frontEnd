import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getPendingApprovals, 
  updateLeaveRequestStatus,
  getLeaveRequestById,
  selectLeave,
  resetLeaveState
} from '../redux/features/leaveFeature';
import { toast, Toaster } from 'react-hot-toast';

const LeaveApprovalDashboard = () => {
  const dispatch = useDispatch();
  const { pendingApprovals, currentLeaveRequest, loading, isUpdating, error, success, message } = useSelector(selectLeave);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingRequestIds, setProcessingRequestIds] = useState([]);

  useEffect(() => {
    dispatch(getPendingApprovals());
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
      // Clear processingRequestIds when there's an error
      setProcessingRequestIds([]);
    }
    if (success && message) {
      toast.success(message, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '👍',
      });
      dispatch(resetLeaveState());
      // Refresh the pending approvals list
      dispatch(getPendingApprovals());
      // Clear processingRequestIds when operation is successful
      setProcessingRequestIds([]);
    }
  }, [error, success, message, dispatch]);

  const handleViewRequest = (requestId) => {
    setSelectedRequestId(requestId);
  };

  const handleUpdateStatus = (requestId, status, comments = '') => {
    // Add requestId to the processing list
    setProcessingRequestIds(prev => [...prev, requestId]);
    
    dispatch(updateLeaveRequestStatus({
      requestId,
      updateData: { status, comments }
    }));
    
    // If we're in detail view, go back to list
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
    }
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
  };

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

  // Filter and search functionality
  const filteredRequests = pendingApprovals.filter(request => {
    const matchesStatus = filterStatus === 'ALL' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveTypeName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (selectedRequestId && currentLeaveRequest) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Leave Request Details</h2>
            <button 
              onClick={handleBackToList}
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to List
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">{currentLeaveRequest.leaveTypeName}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentLeaveRequest.status)}`}>
                {currentLeaveRequest.status}
              </span>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-indigo-700">Employee Information</h4>
              <p className="text-gray-700">{currentLeaveRequest.employeeName}</p>
              <p className="text-gray-600 text-sm">Username: {currentLeaveRequest.userName || 'Not specified'}</p>
              <p className="text-gray-600 text-sm">Email: {currentLeaveRequest.employeeEmail || currentLeaveRequest.email}</p>
              <p className="text-gray-600 text-sm">Department: {currentLeaveRequest.department || 'Not specified'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-500">Start Date</span>
              <p className="font-medium">{formatDate(currentLeaveRequest.startDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">End Date</span>
              <p className="font-medium">{formatDate(currentLeaveRequest.endDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Duration</span>
              <p className="font-medium">{currentLeaveRequest.days || currentLeaveRequest.leaveDuration} days</p>
            </div>
            <div>
              <span className="text-gray-500">Requested On</span>
              <p className="font-medium">{formatDate(currentLeaveRequest.createdAt || new Date())}</p>
            </div>
          </div>

          {currentLeaveRequest.reason && (
            <div className="mb-6">
              <span className="text-gray-500">Reason</span>
              <p className="mt-1 p-3 bg-gray-50 rounded-md">{currentLeaveRequest.reason}</p>
            </div>
          )}

          {currentLeaveRequest.documents && currentLeaveRequest.documents.length > 0 && (
            <div className="mb-6">
              <span className="text-gray-500">Supporting Documents</span>
              <div className="mt-2 space-y-2">
                {currentLeaveRequest.documents.map((doc) => (
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

          {currentLeaveRequest.status === 'PENDING' && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Update Request Status</h3>
              
              <div className="mb-4">
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  id="comments"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add any comments or feedback for the employee..."
                  defaultValue={currentLeaveRequest.comments || ''}
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const comments = document.getElementById('comments').value;
                    handleUpdateStatus(currentLeaveRequest.id, 'APPROVED', comments);
                  }}
                  disabled={isUpdating || processingRequestIds.includes(currentLeaveRequest.id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex justify-center items-center"
                >
                  {processingRequestIds.includes(currentLeaveRequest.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Approve Request'
                  )}
                </button>
                <button
                  onClick={() => {
                    const comments = document.getElementById('comments').value;
                    handleUpdateStatus(currentLeaveRequest.id, 'REJECTED', comments);
                  }}
                  disabled={isUpdating || processingRequestIds.includes(currentLeaveRequest.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex justify-center items-center"
                >
                  {processingRequestIds.includes(currentLeaveRequest.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Reject Request'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
   <>
   <Toaster/>
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Approvals</h1>
        <p className="text-gray-600">Manage leave requests that require your approval</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search by employee, username, or leave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="md:self-end">
            <button 
              onClick={() => dispatch(getPendingApprovals())}
              className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {filteredRequests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{request.employeeName}</div>
                    <div className="text-sm text-gray-500">{request.department || 'Not specified'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.userName || 'Not specified'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.leaveTypeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.days || request.leaveDuration} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(request.startDate)}</div>
                    <div className="text-sm text-gray-500">to {formatDate(request.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewRequest(request.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View Details
                    </button>
                    {request.status === 'PENDING' && (
                      <>
                        {processingRequestIds.includes(request.id) ? (
                          <span className="flex items-center text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                            Processing...
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'APPROVED')}
                              className="text-green-600 hover:text-green-900 mr-4"
                              disabled={processingRequestIds.includes(request.id)}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900"
                              disabled={processingRequestIds.includes(request.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No leave requests found</h3>
          <p className="mt-1 text-gray-500">
            {filterStatus !== 'ALL' 
              ? `There are no ${filterStatus.toLowerCase()} leave requests at this time.` 
              : 'There are no leave requests that match your search criteria.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setFilterStatus('PENDING');
                setSearchTerm('');
                dispatch(getPendingApprovals());
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
   </>
  );
};

export default LeaveApprovalDashboard;