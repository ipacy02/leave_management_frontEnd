// src/features/notifications/NotificationIcon.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchUnreadNotifications,
  selectNotifications 
} from '../../redux/features/NotificationSlice';

const NotificationIcon = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadNotifications, unreadLoading } = useSelector(selectNotifications);
  
  useEffect(() => {
    // Fetch unread notifications when component mounts
    dispatch(fetchUnreadNotifications());
    
    // Set up polling for notifications (every 2 minutes)
    const interval = setInterval(() => {
      dispatch(fetchUnreadNotifications());
    }, 120000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const handleClick = () => {
    navigate('/notifications');
  };
  
  const unreadCount = unreadNotifications?.length || 0;
  
  return (
    <div className="relative cursor-pointer" onClick={handleClick}>
      <Bell size={24} />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;