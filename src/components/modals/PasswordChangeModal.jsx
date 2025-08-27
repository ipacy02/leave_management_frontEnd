import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { 
  changePassword, 
  resetProfileState, 
  selectProfile 
} from '../../redux/features/profileSlice';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff, Lock, Check, AlertCircle } from 'lucide-react';

const PasswordChangeModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(selectProfile);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  // Track if password change action has been attempted
  const [actionAttempted, setActionAttempted] = useState(false);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(resetProfileState());
      setActionAttempted(false);
    }
  }, [isOpen, dispatch]);
  
  useEffect(() => {
    if (actionAttempted && success) {
      toast.success('Password changed successfully', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '🔐',
      });
      
      resetForm();
      onClose();
      dispatch(resetProfileState());
      setActionAttempted(false);
    }
    
    if (actionAttempted && error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
      });
      dispatch(resetProfileState());
      setActionAttempted(false);
    }
  }, [success, error, dispatch, onClose, actionAttempted]);
  
  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setPasswordStrength(0);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Password strength check for newPassword
    if (name === 'newPassword') {
      let strength = 0;
      if (value.length > 5) strength += 1;
      if (value.length > 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      
      setPasswordStrength(strength);
    }
    
    // Check if confirmPassword matches newPassword
    if (name === 'confirmPassword' || name === 'newPassword') {
      if (name === 'confirmPassword' && formData.newPassword !== value) {
        setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (name === 'newPassword' && formData.confirmPassword && formData.confirmPassword !== value) {
        setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      errors.newPassword = 'Password is too weak';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setActionAttempted(true);
      dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }));
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 flex justify-between items-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500 opacity-20 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 opacity-20 rounded-full"></div>
          
          <h3 className="text-xl font-bold text-white relative z-10">Change Password</h3>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    formErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all`}
                  placeholder="Enter current password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formErrors.currentPassword && (
                <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.currentPassword}
                </p>
              )}
            </div>
            
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all`}
                  placeholder="Enter new password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {formData.newPassword && (
                <div>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          passwordStrength >= level 
                            ? level <= 2 
                              ? 'bg-red-400' 
                              : level <= 3 
                                ? 'bg-yellow-400' 
                                : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {passwordStrength <= 2 && "Weak password - Add uppercase, numbers, or symbols"}
                    {passwordStrength === 3 && "Moderate password - Add more variety for stronger security"}
                    {passwordStrength > 3 && "Strong password"}
                  </p>
                </div>
              )}
              
              {formErrors.newPassword && (
                <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.newPassword}
                </p>
              )}
            </div>
            
            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Check className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all`}
                  placeholder="Confirm your new password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium bg-white hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-sm text-sm font-medium transition-all flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Password requirements:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>At least 8 characters long</li>
              <li>Include uppercase letters (A-Z)</li>
              <li>Include numbers (0-9)</li>
              <li>Include special characters (!@#$%^&*)</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

PasswordChangeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PasswordChangeModal;