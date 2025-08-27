import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  resetProfileState,
  selectProfile
} from '../redux/features/profileSlice';
import Avatar from '../components/Avatar';
import toast, { Toaster } from 'react-hot-toast';
import {
  Upload as FiUpload,
  Trash2 as FiTrash2,
  Save as FiSave,
  Lock
} from 'lucide-react';
import PasswordChangeModal from '../components/modals/PasswordChangeModal';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { userData, loading, error, success, message, imageUploading } = useSelector(selectProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [actionPerformed, setActionPerformed] = useState(false);

  useEffect(() => {
    dispatch(resetProfileState());
    dispatch(fetchUserProfile());

    return () => {
      dispatch(resetProfileState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || ''
      });
    }
  }, [userData]);

  useEffect(() => {
    if (actionPerformed && success && message) {
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

      if (isEditing) {
        setIsEditing(false);
      }

      setActionPerformed(false);
      dispatch(resetProfileState());
    }

    if (actionPerformed && error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
        style: {
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      });

      setActionPerformed(false);
      dispatch(resetProfileState());
    }
  }, [success, error, message, isEditing, dispatch, actionPerformed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setActionPerformed(true);
    dispatch(updateUserProfile(formData));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setActionPerformed(true);
      dispatch(uploadProfileImage(file));
    }
  };

  const handleImageDelete = () => {
    if (window.confirm('Are you sure you want to remove your profile image?')) {
      setActionPerformed(true);
      dispatch(deleteProfileImage());
    }
  };

  if (loading && !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full  from-indigo-100 via-purple-50 to-pink-100 p-4">

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
            <h2 className="text-xl font-bold text-white text-center relative z-10">My Profile</h2>
            <p className="text-indigo-100 text-center text-sm mt-1 relative z-10">Manage your information</p>
          </div>

          <div className="p-4">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <Avatar
                  src={userData?.profilePicUrl}
                  name={userData?.fullName}
                  size={80}
                  className="border-2 border-gray-200 rounded-full"
                />

                {imageUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <div className="flex mt-3 space-x-2">
                <label className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-sm cursor-pointer transition-all text-xs font-medium">
                  <FiUpload className="h-3 w-3" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                </label>

                {userData?.profilePicUrl && (
                  <button
                    className="flex items-center gap-1 px-3 py-1 border border-red-400 text-red-600 hover:bg-red-50 rounded-md text-xs font-medium transition-all"
                    onClick={handleImageDelete}
                    disabled={imageUploading}
                  >
                    <FiTrash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-gray-700">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all text-sm"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                  placeholder="Email Address"
                />
              </div>
              
              <div>
                <label htmlFor="department" className="block text-xs font-medium text-gray-700">Department</label>
                <input
                  id="department"
                  type="text"
                  value={userData?.departmentName || 'Not Assigned'}
                  disabled={true}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                />
              </div>

              {userData?.manager && (
                <div>
                  <label htmlFor="manager" className="block text-xs font-medium text-gray-700">Manager</label>
                  <input
                    id="manager"
                    type="text"
                    value={userData.manager.fullName}
                    disabled={true}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                  />
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-xs font-medium text-gray-700">Role</label>
                <input
                  id="role"
                  type="text"
                  value={userData?.role}
                  disabled={true}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                />
              </div>

              <div className="pt-3 flex justify-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      type="button" 
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-sm text-xs font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-md shadow-sm text-xs font-medium"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <Lock className="h-3 w-3" />
                      <span>Change Password</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-sm text-xs font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="ml-1">Saving...</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="h-3 w-3" />
                          <span className="ml-1">Save</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-md shadow-sm text-xs font-medium"
                      onClick={() => {
                        setIsEditing(false);
                        if (userData) {
                          setFormData({
                            fullName: userData.fullName || '',
                            email: userData.email || '',
                          });
                        }
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default ProfilePage;