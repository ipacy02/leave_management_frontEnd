import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaveTypes } from '../../redux/features/leaveFeature';
import { toast } from 'react-hot-toast';
import LeaveBalanceAdjustment from './LeaveBalanceAdjustment';
import CreateLeaveTypeForm from "../leave/LeaveTypeForm";

const LeaveTypeManagement = () => {
  const [activeTab, setActiveTab] = useState('leaveTypes');
  const dispatch = useDispatch();
  const { leaveTypes, loading, error } = useSelector(state => state.leave);
  
  useEffect(() => {
    dispatch(fetchLeaveTypes());
  }, [dispatch]);

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

  const renderLeaveTypesContent = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Leave Types Management</h2>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Existing Leave Types</h3>
          
          {loading && <div className="text-center py-4">Loading leave types...</div>}
          
          {!loading && leaveTypes.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No leave types have been created yet.</p>
            </div>
          )}
          
          {!loading && leaveTypes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Docs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carry Forward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaveTypes.map((leaveType) => (
                    <tr key={leaveType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: leaveType.color }}></div>
                          <span className="font-medium">{leaveType.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{leaveType.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{leaveType.daysPerYear}</td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-xs">{leaveType.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {leaveType.requiresDocumentation ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Yes</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {leaveType.carryForward ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Yes (Max: {leaveType.maxCarryForwardDays})
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('leaveTypes')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'leaveTypes'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leave Types
            </button>
            <button
              onClick={() => setActiveTab('leaveBalance')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'leaveBalance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leave Balance Adjustment
            </button>
            <button
              onClick={() => setActiveTab('createLeaveType')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'createLeaveType'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Leave Type
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'leaveTypes' && renderLeaveTypesContent()}
        {activeTab === 'leaveBalance' && <LeaveBalanceAdjustment />}
        {activeTab === 'createLeaveType' && <CreateLeaveTypeForm />}
      </div>
    </div>
  );
};

export default LeaveTypeManagement;