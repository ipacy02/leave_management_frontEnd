 // src/auth/authService.js
import { connectWebSocket, disconnectWebSocket } from '../services/websocketService';
import { setWebSocketConnected } from '../redux/features/NotificationSlice';
// Changed from named import to default import
import store from '../redux/store';

// Add this to your login success handler
export const initializeAfterLogin = async () => {
  try {
    // Connect to WebSocket
    await connectWebSocket();
    store.dispatch(setWebSocketConnected(true));
    console.log('WebSocket connection established after login');
  } catch (error) {
    console.error('Failed to initialize WebSocket after login:', error);
  }
};

// Add this to your logout handler
export const cleanupBeforeLogout = () => {
  disconnectWebSocket();
  store.dispatch(setWebSocketConnected(false));
  console.log('WebSocket connection closed before logout');
};