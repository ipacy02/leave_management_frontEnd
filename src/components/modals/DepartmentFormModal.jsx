import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createDepartment, updateDepartment } from '../../redux/features/departmentsSlice';
import { X as XIcon } from 'lucide-react';

const DepartmentFormModal = ({ isOpen, onClose, department = null, setActionPerformed, managers }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.departments);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headId: ''
  });
  
  // Initialize form with department data if editing
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        headId: department.headId || ''
      });
    } else {
      // Reset form when creating a new department
      setFormData({
        name: '',
        description: '',
        headId: ''
      });
    }
  }, [department, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create payload
    const payload = {
      name: formData.name,
      description: formData.description,
    };
    
    // Only include headId if selected
    if (formData.headId) {
      payload.headId = formData.headId;
    }

    setActionPerformed(true);
    
    if (department) {
      // Update existing department
      dispatch(updateDepartment({ id: department.id, departmentData: payload }));
    } else {
      // Create new department
      dispatch(createDepartment(payload));
    }
    
    onClose();
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Center modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Modal header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              {department ? 'Edit Department' : 'Create Department'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 focus:outline-none"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Modal body */}
          <div className="bg-white px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter department name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter department description"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="headId" className="block text-sm font-medium text-gray-700 mb-1">
                  Department Head
                </label>
                <select
                  id="headId"
                  name="headId"
                  value={formData.headId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- No Department Head --</option>
                  {managers && managers.length > 0 ? (
                    managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName} ({manager.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>No managers available</option>
                  )}
                </select>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
                >
                  {loading ? (
                    <span>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : department ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentFormModal;