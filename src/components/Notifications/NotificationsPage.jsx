import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllNotifications, 
  markAllNotificationsAsRead,
  selectNotifications,
  markAllAsReadLocal 
} from '../../redux/features/NotificationSlice';
import NotificationItem from './NotificationItem';
import { toast } from 'react-hot-toast';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector(selectNotifications);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  
  // Fetch notifications when component mounts
  useEffect(() => {
    dispatch(fetchAllNotifications());
  }, [dispatch]);
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
      .unwrap()
      .then(() => {
        dispatch(markAllAsReadLocal()); // Optimistically update UI
        toast.success('All notifications marked as read', {
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
      })
      .catch((err) => {
        toast.error(err?.error || 'Failed to mark all as read');
      });
  };
  
  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg">
              <button
                className={`px-4 py-2 text-sm rounded-l-lg ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 text-sm ${filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
              <button
                className={`px-4 py-2 text-sm rounded-r-lg ${filter === 'read' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
                onClick={() => setFilter('read')}
              >
                Read
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                className="text-sm text-indigo-600 hover:text-indigo-800"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;