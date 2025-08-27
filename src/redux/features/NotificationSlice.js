 // src/redux/features/NotificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get the current token from storage
const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

// Configure axios instance with authorization interceptor
const configureAxiosInstance = () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Get all notifications
export const fetchAllNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Fetch notifications error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch notifications' });
    }
  }
);

// Get unread notifications
export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnread',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get('/notifications/unread');
      return response.data;
    } catch (error) {
      console.error('Fetch unread notifications error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch unread notifications' });
    }
  }
);

// Mark a notification as read (HTTP fallback)
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark notification as read error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to mark notification as read' });
    }
  }
);

// Mark all notifications as read (HTTP fallback)
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      await api.put('/notifications/read-all');
      return true;
    } catch (error) {
      console.error('Mark all notifications as read error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to mark all notifications as read' });
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadNotifications: [],
    unreadCount: 0,
    loading: false,
    unreadLoading: false,
    error: null,
    success: false,
    message: '',
    webSocketConnected: false
  },
  reducers: {
    resetNotificationState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = [];
      state.unreadCount = 0;
    },
    // New action for WebSocket notifications
    addNotification: (state, action) => {
      const notification = action.payload;
      
      // Add to notifications array if not already there
      if (!state.notifications.some(n => n.id === notification.id)) {
        state.notifications.unshift(notification);
      }
      
      // Add to unread notifications if it's unread
      if (!notification.isRead && !state.unreadNotifications.some(n => n.id === notification.id)) {
        state.unreadNotifications.unshift(notification);
        state.unreadCount += 1;
      }
    },
    // Update notification count from WebSocket
    updateNotificationCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    // Mark notification as read locally (for WebSocket optimistic updates)
    markNotificationAsReadLocal: (state, action) => {
      const notificationId = action.payload;
      
      // Update in notifications list
      const index = state.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        state.notifications[index] = {
          ...state.notifications[index],
          isRead: true,
          readAt: new Date().toISOString()
        };
      }
      
      // Remove from unread notifications
      state.unreadNotifications = state.unreadNotifications.filter(n => n.id !== notificationId);
      
      // Update unread count
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    // Mark all as read locally (for WebSocket optimistic updates)
    markAllAsReadLocal: (state) => {
      // Mark all notifications as read
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date().toISOString()
      }));
      
      // Clear unread notifications
      state.unreadNotifications = [];
      state.unreadCount = 0;
    },
    // Set WebSocket connection status
    setWebSocketConnected: (state, action) => {
      state.webSocketConnected = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Notifications
      .addCase(fetchAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.success = true;
        
        // Update unread count based on notifications
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch notifications';
      })
      
      // Fetch Unread Notifications
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.unreadLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadLoading = false;
        state.unreadNotifications = action.payload;
        state.unreadCount = action.payload.length;
        state.success = true;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.unreadLoading = false;
        state.error = action.payload?.error || 'Failed to fetch unread notifications';
      })
      
      // Mark Notification as Read (HTTP fallback)
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        // Update the notification in the notifications list
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
        
        // Remove from unread notifications
        state.unreadNotifications = state.unreadNotifications.filter(n => n.id !== action.payload.id);
        
        // Update unread count
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
        
        state.success = true;
        state.message = 'Notification marked as read';
      })
      
      // Mark All Notifications as Read (HTTP fallback)
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        // Mark all notifications as read in the notifications list
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }));
        
        // Clear unread notifications
        state.unreadNotifications = [];
        state.unreadCount = 0;
        
        state.success = true;
        state.message = 'All notifications marked as read';
      });
  }
});

export const { 
  resetNotificationState, 
  clearNotifications,
  addNotification,
  updateNotificationCount,
  markNotificationAsReadLocal,
  markAllAsReadLocal,
  setWebSocketConnected
} = notificationSlice.actions;

// Create and export notification selector
export const selectNotifications = (state) => state.notifications;

export default notificationSlice.reducer;