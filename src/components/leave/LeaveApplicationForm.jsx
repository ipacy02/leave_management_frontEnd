import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLeaveTypes,
  fetchUserLeaveBalances,
  createLeaveRequestWithDocuments,
  selectLeave,
  resetLeaveState
} from '../../redux/features/leaveFeature';
import toast,  { Toaster } from 'react-hot-toast';

import { format } from 'date-fns';

const LeaveApplicationForm = () => {
  const dispatch = useDispatch();
  const { leaveTypes, leaveBalances, isCreating, success, error, message } = useSelector(selectLeave);
  
  // Form state
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    fullDay: true,
    documentIds: []
  });
  
  // File state
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Selected leave type info for displaying balance
  const [selectedLeaveTypeBalance, setSelectedLeaveTypeBalance] = useState(null);
  
  // Load leave types and balances on component mount
  useEffect(() => {
    dispatch(fetchLeaveTypes());
    dispatch(fetchUserLeaveBalances());
  }, [dispatch]);
  
  // Update selected leave type balance when leave type or balances change
  useEffect(() => {
    if (formData.leaveTypeId && leaveBalances.length > 0) {
      const balance = leaveBalances.find(b => b.leaveTypeId === formData.leaveTypeId);
      setSelectedLeaveTypeBalance(balance || null);
    } else {
      setSelectedLeaveTypeBalance(null);
    }
  }, [formData.leaveTypeId, leaveBalances]);
  
  // Handle success and error messages
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
        icon: '🎉',
      });
      // Reset form after successful submission
      setFormData({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        fullDay: true,
        documentIds: []
      });
      setFiles([]);
      setFileNames([]);
      setErrors({});
      
      // Reset leave state in Redux
      dispatch(resetLeaveState());
    }
    
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #ef4444, #b91c1c)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '❌',
      });
      
      dispatch(resetLeaveState());
    }
  }, [success, error, message, dispatch]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle file input changes
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Update file names for display
    const names = selectedFiles.map(file => file.name);
    setFileNames(names);
    
    // Clear validation error when files are added
    if (errors.files) {
      setErrors({
        ...errors,
        files: ''
      });
    }
  };
  
  // Calculate business days difference (rough estimate, backend does the actual calculation)
  const calculateDaysDifference = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const daysDiff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(0, daysDiff);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.leaveTypeId) {
      newErrors.leaveTypeId = 'Please select a leave type';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for leave is required';
    }
    
    // Check if selected leave type requires documents but none were uploaded
    const selectedLeaveType = leaveTypes.find(type => type.id === formData.leaveTypeId);
    if (selectedLeaveType?.requiresDoc && files.length === 0 && formData.documentIds.length === 0) {
      newErrors.files = 'This leave type requires supporting documents';
    }
    
    // Check if leave balance is sufficient (rough client-side check)
    if (selectedLeaveTypeBalance && calculateDaysDifference() > selectedLeaveTypeBalance.availableDays) {
      newErrors.general = 'Requested days exceed your available balance';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create leave request payload
      const leaveRequest = {
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        fullDay: formData.fullDay,
        documentIds: formData.documentIds
      };
      
      // Dispatch action to create leave request with documents
      dispatch(createLeaveRequestWithDocuments({
        leaveRequest,
        files
      }));
    }
  };
  
  // Get selected leave type name
  const getSelectedLeaveTypeName = () => {
    const selectedType = leaveTypes.find(type => type.id === formData.leaveTypeId);
    return selectedType ? selectedType.name : '';
  };
  
  return (
   <>
   <Toaster/>
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Apply for Leave</h2>
      
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Leave Type */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="leaveType">
            Leave Type *
          </label>
          <select
            id="leaveType"
            name="leaveTypeId"
            value={formData.leaveTypeId}
            onChange={handleInputChange}
            className={`w-full p-3 border ${errors.leaveTypeId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="">Select a leave type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}{type.requiresDoc ? ' (Requires Documentation)' : ''}
              </option>
            ))}
          </select>
          {errors.leaveTypeId && <p className="text-red-500 text-xs mt-1">{errors.leaveTypeId}</p>}
          
          {selectedLeaveTypeBalance && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Available Balance:</span> {selectedLeaveTypeBalance.availableDays} days
              </p>
            </div>
          )}
        </div>
        
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="startDate">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={formData.startDate}
              onChange={handleInputChange}
              className={`w-full p-3 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="endDate">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              min={formData.startDate || format(new Date(), 'yyyy-MM-dd')}
              value={formData.endDate}
              onChange={handleInputChange}
              className={`w-full p-3 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
          </div>
        </div>
        
        {/* Full Day Option */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fullDay"
              name="fullDay"
              checked={formData.fullDay}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="fullDay" className="ml-2 block text-sm text-gray-700">
              Full day leave (uncheck for half-day)
            </label>
          </div>
        </div>
        
        {formData.startDate && formData.endDate && (
          <div className="mb-4 p-2 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Estimated Duration:</span> {calculateDaysDifference()} day(s)
              <span className="text-xs text-gray-500 ml-2">(Actual business days will be calculated by the system)</span>
            </p>
          </div>
        )}
        
        {/* Reason */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="reason">
            Reason for Leave *
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows="4"
            placeholder="Please provide details about your leave request"
            className={`w-full p-3 border ${errors.reason ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          ></textarea>
          {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
        </div>
        
        {/* Supporting Documents */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="documents">
            {formData.leaveTypeId && leaveTypes.find(type => type.id === formData.leaveTypeId)?.requiresDoc 
              ? 'Supporting Documents (Required) *' 
              : 'Supporting Documents (Optional)'}
          </label>
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="dropzone-file" 
              className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                errors.files ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
              } border-dashed rounded-lg cursor-pointer hover:bg-gray-100`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className={`w-8 h-8 mb-3 ${errors.files ? 'text-red-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className={`mb-1 text-sm ${errors.files ? 'text-red-500' : 'text-gray-500'}`}>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className={`text-xs ${errors.files ? 'text-red-500' : 'text-gray-500'}`}>
                  PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                </p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </div>
          
          {errors.files && <p className="text-red-500 text-xs mt-1">{errors.files}</p>}
          
          {fileNames.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Selected files:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                {fileNames.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Summary */}
        {formData.leaveTypeId && formData.startDate && formData.endDate && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-md">
            <h3 className="text-sm font-semibold text-indigo-800 mb-2">Leave Request Summary</h3>
            <ul className="text-sm text-indigo-700">
              <li><span className="font-medium">Leave Type:</span> {getSelectedLeaveTypeName()}</li>
              <li><span className="font-medium">Period:</span> {format(new Date(formData.startDate), 'dd MMM yyyy')} to {format(new Date(formData.endDate), 'dd MMM yyyy')}</li>
              <li><span className="font-medium">Duration:</span> Approximately {calculateDaysDifference()} day(s)</li>
              <li><span className="font-medium">Type:</span> {formData.fullDay ? 'Full Day' : 'Half Day'}</li>
            </ul>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isCreating}
            className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-md shadow hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isCreating ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Leave Request'
            )}
          </button>
        </div>
      </form>
    </div>
   </>
  );
};

export default LeaveApplicationForm;