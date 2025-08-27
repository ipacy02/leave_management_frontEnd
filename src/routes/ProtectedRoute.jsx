 // src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, refreshToken } from '../redux/features/authSlice';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Try to get the current user if we have a token but no user data
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser()).unwrap().catch(() => {
        // If getCurrentUser fails, try refresh token
        dispatch(refreshToken());
      });
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    // You can replace this with a loading spinner component
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;