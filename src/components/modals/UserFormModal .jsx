import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createUser, 
  updateUser,
  selectUsers,
  getAllManagers
} from '../../redux/features/usersSlice';
import { X as XIcon, Upload, User } from 'lucide-react';
import { fetchAllDepartments } from '../../redux/features/departmentsSlice';

const UserFormModal = ({ isOpen, onClose, user = null, setActionPerformed }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { loading, managers } = useSelector(selectUsers);
  const { departments } = useSelector(state => state.departments);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'STAFF', // Changed default role from EMPLOYEE to STAFF
    profilePicture: null,
    profilePicUrl: '',
    managerId: '',
    departmentId: ''
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  
  // Fetch managers and departments when modal is opened
  useEffect(() => {
    if (isOpen) {
      dispatch(getAllManagers());
      dispatch(fetchAllDepartments());
    }
  }, [isOpen, dispatch]);
  
  // Initialize form with user data if editing
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        fullName: user.fullName || '',
        password: '', // Don't populate password field when editing
        role: user.role || 'STAFF', // Changed default from EMPLOYEE to STAFF
        profilePicture: null,
        profilePicUrl: user.profilePicUrl || '',
        managerId: user.manager?.id || '',
        departmentId: user.departmentId || ''
      });
      
      // Set preview image if user has a profile pic
      if (user.profilePicUrl) {
        setPreviewImage(user.profilePicUrl);
      } else {
        setPreviewImage(null);
      }
    } else {
      // Reset form when creating a new user
      setFormData({
        email: '',
        fullName: '',
        password: '',
        role: 'STAFF', // Changed default from EMPLOYEE to STAFF
        profilePicture: null,
        profilePicUrl: '',
        managerId: '',
        departmentId: ''
      });
      setPreviewImage(null);
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare payload - Exclude empty values and password if not provided
    const payload = {
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role
    };
    
    // Include password only if provided (required for new users)
    if (formData.password) {
      payload.password = formData.password;
    }
    
    // Handle image upload if a file is selected
    if (formData.profilePicture) {
      // In a real application, you would upload the image to a server/cloud storage
      // and get back a URL to store in the database
      // Here's a placeholder for that process:
      
      // const imageUrl = await uploadImageToServer(formData.profilePicture);
      // payload.profilePicUrl = imageUrl;
      
      // For this example, we'll assume the image is processed and just use the name
      payload.profilePicUrl = URL.createObjectURL(formData.profilePicture);
    } else if (formData.profilePicUrl) {
      payload.profilePicUrl = formData.profilePicUrl;
    }
    
    if (formData.managerId) {
      payload.managerId = formData.managerId;
    }
    
    if (formData.departmentId) {
      payload.departmentId = formData.departmentId;
    }

    setActionPerformed(true);
    
    if (user) {
      // Update existing user
      dispatch(updateUser({ id: user.id, userData: payload }));
    } else {
      // Create new user
      dispatch(createUser(payload));
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

        {/* Center modal with increased width */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Modal header with improved gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              {user ? 'Edit User Profile' : 'Add New Team Member'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 transition-colors focus:outline-none"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Modal body with improved spacing */}
          <div className="bg-white px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile picture upload section */}
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-32 h-32 rounded-full border-2 border-indigo-300 flex items-center justify-center overflow-hidden bg-gray-100 cursor-pointer hover:border-indigo-500 transition-colors"
                    onClick={handleImageUploadClick}
                  >
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    onClick={handleImageUploadClick}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {previewImage ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter email address"
                    disabled={user !== null} // Email can't be changed for existing users
                  />
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password {user ? '(Leave empty to keep current password)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!user} // Password is required only for new users
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={user ? "Leave empty to keep current password" : "Enter password"}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="">No Department</option>
                    {departments?.map(department => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <select
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">No Manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.fullName} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm disabled:opacity-70 transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {user ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{user ? 'Update User' : 'Create User'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;