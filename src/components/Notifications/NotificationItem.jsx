import React from 'react';
import { useDispatch } from 'react-redux';
import { markNotificationAsRead } from '../../redux/features/NotificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

// Icons (import as needed from your icon library)
import { CheckIcon } from 'lucide-react'; // Replace with your icon imports

const NotificationItem = ({ notification }) => {
  const dispatch = useDispatch();
  
  const handleMarkAsRead = () => {
    if (notification.isRead) return;
    
    dispatch(markNotificationAsRead(notification.id))
      .unwrap()
      .then(() => {
        toast.success('Notification marked as read', { duration: 2000 });
      })
      .catch((err) => {
        toast.error(err?.error || 'Failed to mark notification as read');
      });
  };
  
  // Format notification time
  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : 'recently';
  
  // Determine icon based on notification type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'LEAVE_REQUEST':
        return <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-500">📅</div>;
      case 'LEAVE_APPROVED':
        return <div className="h-10 w-10 flex items-center justify-center bg-green-100 rounded-full text-green-500">✓</div>;
      case 'LEAVE_REJECTED':
        return <div className="h-10 w-10 flex items-center justify-center bg-red-100 rounded-full text-red-500">✗</div>;
      case 'SYSTEM':
        return <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500">🔔</div>;
      default:
        return <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-500">🔔</div>;
    }
  };
  
  return (
    <div className={`px-4 py-3 border-b hover:bg-gray-50 flex items-start gap-3 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
      {getNotificationIcon()}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
            {notification.message}
          </p>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {timeAgo}
          </span>
        </div>
        
        {notification.data && (
          <div className="mt-1 text-xs text-gray-600">
            {notification.data.additionalInfo}
          </div>
        )}
      </div>
      
      {!notification.isRead && (
        <button 
          onClick={handleMarkAsRead}
          className="ml-2 p-1 text-blue-600 hover:text-blue-800"
          title="Mark as read"
        >
          <CheckIcon size={16} />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;