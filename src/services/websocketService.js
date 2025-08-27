 // src/services/websocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import store from '../redux/store';
import { 
  addNotification, 
  updateNotificationCount,
  markNotificationAsReadLocal,
  markAllAsReadLocal,
  setWebSocketConnected
} from '../redux/features/NotificationSlice';

// Extract base URL without /api/v1
const BASE_URL = import.meta.env.VITE_API_URL.split('/api/v1')[0];
let stompClient = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Function to get the auth token
const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

// Parse the token to get just the JWT part without Bearer prefix
const getCleanToken = () => {
  const token = getAuthToken();
  return token ? token.replace('Bearer ', '') : null;
};

// Connect to WebSocket server
export const connectWebSocket = () => {
  const token = getAuthToken();
  const cleanToken = getCleanToken();
  
  if (!token) {
    console.error('No authentication token found');
    return Promise.reject('Authentication required');
  }
  
  // Update connection status in store
  store.dispatch(setWebSocketConnected(false));
  
  // Reset reconnect attempts
  reconnectAttempts = 0;

  return new Promise((resolve, reject) => {
    try {
      // If already connected, disconnect first
      if (stompClient && stompClient.connected) {
        disconnectWebSocket();
      }

      console.log(`Connecting to WebSocket at ${BASE_URL}/ws`);
      
      // Create a new STOMP client
      stompClient = new Client({
        webSocketFactory: () => {
          // Pass token as query parameter for handshake
          return new SockJS(`${BASE_URL}/ws?token=${encodeURIComponent(cleanToken)}`);
        },
        connectHeaders: {
          'Authorization': `Bearer ${cleanToken}`
        },
        debug: (process.env.NODE_ENV !== 'production') ? 
          function(str) { console.debug('STOMP: ' + str); } : 
          undefined,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });
      
      // On connect event
      stompClient.onConnect = (frame) => {
        console.log('Connected to WebSocket server', frame);
        isConnected = true;
        reconnectAttempts = 0;
        store.dispatch(setWebSocketConnected(true));
        
        // Subscribe to user-specific notification channel
        stompClient.subscribe('/user/queue/notifications', (message) => {
          try {
            const notification = JSON.parse(message.body);
            store.dispatch(addNotification(notification));
          } catch (error) {
            console.error('Error processing notification:', error);
          }
        });
        
        // Subscribe to notification count updates
        stompClient.subscribe('/user/queue/notification-count', (message) => {
          try {
            const data = JSON.parse(message.body);
            store.dispatch(updateNotificationCount(data.count));
          } catch (error) {
            console.error('Error processing notification count:', error);
          }
        });
        
        // Send a connect message to register the session
        stompClient.publish({
          destination: '/app/notifications.connect',
          headers: { 
            'content-type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`
          }
        });
        
        resolve();
      };
      
      // On error
      stompClient.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        isConnected = false;
        store.dispatch(setWebSocketConnected(false));
        
        // Try to reconnect
        handleReconnect();
        reject(frame.headers['message']);
      };
      
      // Handle connection errors
      stompClient.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        isConnected = false;
        store.dispatch(setWebSocketConnected(false));
        
        // Try to reconnect
        handleReconnect();
        reject(error);
      };
      
      // Handle connection close
      stompClient.onWebSocketClose = (event) => {
        console.log('WebSocket connection closed:', event);
        isConnected = false;
        store.dispatch(setWebSocketConnected(false));
        
        // Try to reconnect
        handleReconnect();
      };
      
      // Start the connection
      stompClient.activate();
    } catch (error) {
      console.error('Error creating STOMP client:', error);
      store.dispatch(setWebSocketConnected(false));
      
      // Try to reconnect
      handleReconnect();
      reject(error);
    }
  });
};

// Handle reconnection logic
const handleReconnect = () => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff with max 30s
    
    console.log(`WebSocket reconnect attempt ${reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!isConnected && getAuthToken()) {
        connectWebSocket().catch(err => {
          console.warn('Reconnect attempt failed:', err);
        });
      }
    }, delay);
  } else {
    console.warn('Maximum WebSocket reconnect attempts reached. Manual reconnection required.');
  }
};

// Disconnect from WebSocket server
 // Disconnect from WebSocket server
export const disconnectWebSocket = () => {
  if (stompClient) {
    try {
      // Only try to publish if we have a valid connection
      if (stompClient.connected && isConnected) {
        try {
          // Send a disconnect message to server
          stompClient.publish({
            destination: '/app/notifications.disconnect',
            headers: { 'content-type': 'application/json' }
          });
        } catch (publishError) {
          console.warn('Could not send disconnect message:', publishError);
          // Continue with disconnection even if the publish fails
        }
      }
      
      // Always try to deactivate the client
      stompClient.deactivate();
      isConnected = false;
      store.dispatch(setWebSocketConnected(false));
      console.log('Disconnected from WebSocket server');
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error);
    } finally {
      // Ensure we reset connection status even if an error occurs
      isConnected = false;
      store.dispatch(setWebSocketConnected(false));
    }
  }
};
// Mark a notification as read via WebSocket
export const markNotificationReadWS = (notificationId) => {
  if (!stompClient || !isConnected) {
    console.error('WebSocket not connected');
    return false;
  }
  
  try {
    const cleanToken = getCleanToken();
    stompClient.publish({
      destination: '/app/notifications.markAsRead',
      body: JSON.stringify({ id: notificationId }),
      headers: { 
        'content-type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
      }
    });
    
    // Update local state optimistically
    store.dispatch(markNotificationAsReadLocal(notificationId));
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read via WebSocket
export const markAllNotificationsReadWS = () => {
  if (!stompClient || !isConnected) {
    console.error('WebSocket not connected');
    return false;
  }
  
  try {
    const cleanToken = getCleanToken();
    stompClient.publish({
      destination: '/app/notifications.markAllAsRead',
      headers: { 
        'content-type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
      }
    });
    
    // Update local state optimistically
    store.dispatch(markAllAsReadLocal());
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};


export const isWebSocketConnected = () => isConnected;



// Helper function to reconnect if connection is lost
export const ensureConnected = async () => {
  if (!isConnected && getAuthToken()) {
    try {
      await connectWebSocket();
      return true;
    } catch (error) {
      console.error('Failed to reconnect to WebSocket:', error);
      return false;
    }
  }
  return isConnected;
};