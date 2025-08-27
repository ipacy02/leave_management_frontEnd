import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserLeaveBalances, adjustLeaveBalance, fetchLeaveTypes } from '../../redux/features/leaveFeature';
import { getAllUsers } from '../../redux/features/usersSlice';
import { toast } from 'react-hot-toast';

const LeaveBalanceAdjustment = () => {
  const dispatch = useDispatch();
  const { leaveBalances, leaveTypes, isUpdating, error, success, message } = useSelector(state => state.leave);
  const { users, loading: usersLoading } = useSelector(state => state.users);
  
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustment, setAdjustment] = useState({
    userId: '',
    leaveTypeId: '',
    amount: 0,
    reason: '',
    operation: 'ADD' // ADD or SUBTRACT
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(fetchLeaveTypes());
    dispatch(fetchUserLeaveBalances());
  }, [dispatch]);

  // Filter users based on search term
  useEffect(() => {
    if (users && users.length > 0) {
      const filtered = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Handle success message
  useEffect(() => {
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
        icon: '✅',
      });
      setIsAdjusting(false);
      resetForm();
    }
  }, [success, message]);

  // Handle error message
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #ef4444, #dc2626)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '❌',
      });
    }
  }, [error]);

  const resetForm = () => {
    setAdjustment({
      userId: '',
      leaveTypeId: '',
      amount: 0,
      reason: '',
      operation: 'ADD'
    });
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setAdjustment(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data for the API - FIXED: Using adjustmentDays instead of amount
    const adjustmentData = {
      userId: adjustment.userId,
      leaveTypeId: adjustment.leaveTypeId,
      adjustmentDays: adjustment.operation === 'ADD' ? Math.abs(adjustment.amount) : -Math.abs(adjustment.amount),
      reason: adjustment.reason
    };
    
    dispatch(adjustLeaveBalance(adjustmentData));
  };

  // Find the leave type by ID to display the color
  const getLeaveTypeColor = (leaveTypeId) => {
    const leaveType = leaveTypes.find(type => type.id === leaveTypeId);
    return leaveType ? leaveType.color : '#cccccc';
  };

  // Find user by ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leave Balance Adjustment</h2>
        <button
          onClick={() => setIsAdjusting(!isAdjusting)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
        >
          {isAdjusting ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Adjust Balance
            </>
          )}
        </button>
      </div>
      
      {usersLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {isAdjusting && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Adjust Leave Balance</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                {searchTerm && filteredUsers.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${adjustment.userId === user.id ? 'bg-indigo-50' : ''}`}
                        onClick={() => {
                          setAdjustment(prev => ({ ...prev, userId: user.id }));
                          setSearchTerm(user.fullName); // Set search term to selected user name
                        }}
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={user.profilePicUrl || "https://randomuser.me/api/portraits/lego/1.jpg"}
                            alt={user.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="ml-auto">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {user.role}
                          </span>
                          {user.departmentName && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.departmentName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchTerm && filteredUsers.length === 0 && (
                  <div className="mt-2 p-3 text-center text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                    No users found matching "{searchTerm}"
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                <select
                  name="leaveTypeId"
                  value={adjustment.leaveTypeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation *</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="add"
                      name="operation"
                      value="ADD"
                      checked={adjustment.operation === 'ADD'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="add" className="ml-2 block text-sm text-gray-700">
                      Add
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="subtract"
                      name="operation"
                      value="SUBTRACT"
                      checked={adjustment.operation === 'SUBTRACT'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="subtract" className="ml-2 block text-sm text-gray-700">
                      Subtract
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Days) *</label>
                <input
                  type="number"
                  name="amount"
                  value={adjustment.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  name="reason"
                  value={adjustment.reason}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder="Please provide a reason for this adjustment"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAdjusting(false);
                  resetForm();
                }}
                className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
                disabled={isUpdating || !adjustment.userId || !adjustment.leaveTypeId}
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adjusting...
                  </>
                ) : (
                  'Adjust Balance'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Current Leave Balances</h3>
          <div className="flex items-center">
            <button
              onClick={() => dispatch(fetchUserLeaveBalances())}
              className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              title="Refresh leave balances"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {leaveBalances.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-500">No leave balances available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Employee</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Leave Type</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Total Days</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Used Days</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Pending Days</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Adjustment</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Available Days</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">Year</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveBalances.map((balance) => {
                  const user = getUserById(balance.userId);
                  return (
                    <tr key={balance.id} className="hover:bg-gray-50">
                      <td className="py-4 whitespace-nowrap pl-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img 
                              className="h-8 w-8 rounded-full object-cover" 
                              src={user?.profilePicUrl || "https://randomuser.me/api/portraits/lego/1.jpg"} 
                              alt={user?.fullName || 'User'}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user?.fullName || 'Unknown User'}</div>
                            <div className="text-xs text-gray-500">{user?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 whitespace-nowrap pl-4">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: getLeaveTypeColor(balance.leaveTypeId) }}
                          ></div>
                          <span className="text-sm">{balance.leaveTypeName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 whitespace-nowrap pl-4">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {balance.totalDays}
                        </span>
                      </td>
                      <td className="py-4 whitespace-nowrap pl-4">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {balance.usedDays}
                        </span>
                      </td>
                      <td className="py-4 whitespace-nowrap pl-4">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {balance.pendingDays}
                        </span>
                      </td>
                      <td className="py-4 whitespace-nowrap pl-4">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {balance.adjustmentDays}
                        </span>
                      </td>
                      <td className="py-4 whitespace-nowrap pl-4">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {balance.availableDays}
                        </span>
                      </td>
                      <td className="py-4 whitespace-nowrap text-sm text-gray-500 pl-4">
                        {balance.year}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveBalanceAdjustment;