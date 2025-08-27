import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { restoreSession, refreshToken } from '../redux/features/authSlice';

/**
 * Custom hook for authentication-related functionality
 * @returns {Object} Authentication state and utility functions
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, refreshToken: refreshTokenValue, isAuthenticated, loading, error } = useSelector(state => state.auth);
  const [initialized, setInitialized] = useState(false);

  // On mount, try to restore the session
  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(restoreSession()).unwrap();
      } catch (error) {
        console.log('No valid session found or session expired');
      } finally {
        setInitialized(true);
      }
    };

    if (!initialized && !isAuthenticated) {
      initAuth();
    }
  }, [dispatch, initialized, isAuthenticated]);

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    
    // Refresh token every 55 minutes (assuming JWT expiration is 1 hour)
    const refreshInterval = 55 * 60 * 1000; // 55 minutes in milliseconds
    const intervalId = setInterval(() => {
      dispatch(refreshToken());
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated, token]);

  // Function to check if the user has specific roles
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role.toLowerCase());
    }
    
    return user.role.toLowerCase() === requiredRoles.toLowerCase();
  };

  // Check if the user is an admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if the user is an employee
  const isEmployee = () => {
    return hasRole('employee');
  };

  // Check if the user is a manager
  const isManager = () => {
    return hasRole('manager');
  };

  return {
    user,
    token,
    refreshToken: refreshTokenValue,
    isAuthenticated,
    loading,
    error,
    initialized,
    hasRole,
    isAdmin,
    isEmployee,
    isManager
  };
};

export default useAuth;