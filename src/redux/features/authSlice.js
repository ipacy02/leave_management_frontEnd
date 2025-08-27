import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password 
      });
      
      // Store tokens based on remember me option
      if (rememberMe) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } else {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return {
        user: {
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role?.toLowerCase() || 'user'
        },
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Check for specific error types from the backend
      if (error.response?.data?.error === 'Invalid credentials') {
        return rejectWithValue({ error: 'Invalid email or password' });
      }
      
      return rejectWithValue(error.response?.data || { error: error.message || 'Login failed' });
    }
  }
);

// Microsoft authentication thunk
export const microsoftAuth = createAsyncThunk(
  'auth/microsoftAuth',
  async ({ code, rememberMe = false }, { rejectWithValue }) => {
    try {
      // Validate code
      if (!code) {
        throw new Error('No authorization code provided');
      }
      
      // Exchange code for tokens
      const response = await axios.post(
        `${API_URL}/auth/microsoft`,
        { code }
      );
      
      // Store tokens based on remember me option
      if (rememberMe) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } else {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return {
        user: {
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role?.toLowerCase() || 'user'
        },
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        message: 'Microsoft authentication successful'
      };
    } catch (error) {
      console.error('Microsoft auth error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { error: error.message || 'Microsoft authentication failed' }
      );
    }
  }
);

// Async thunk to refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Try localStorage first, then sessionStorage
      let refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      
      // Update tokens in the same storage they were in
      if (localStorage.getItem('refreshToken')) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } else {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return {
        user: {
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role?.toLowerCase() || 'user'
        },
        token: response.data.token,
        refreshToken: response.data.refreshToken
      };
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      // Clear tokens from both storage locations
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      return rejectWithValue(error.response?.data || { error: 'Failed to refresh token' });
    }
  }
);

// Async thunk to restore session
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Try localStorage first, then sessionStorage
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return {
        user: {
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role?.toLowerCase() || 'user'
        },
        token: token,
        refreshToken: response.data.refreshToken || 
            localStorage.getItem('refreshToken') || 
            sessionStorage.getItem('refreshToken')
      };
    } catch (error) {
      console.error('Restore session error:', error.response?.data || error.message);
      
      // If token expired, try to refresh
      if (error.response?.status === 401) {
        try {
          return await dispatch(refreshToken()).unwrap();
        } catch (refreshError) {
          // If refresh fails, clear tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          
          return rejectWithValue(refreshError || { error: 'Session expired' });
        }
      }
      
      // Clear tokens from both storage locations
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      
      return rejectWithValue(error.response?.data || { error: 'Session restoration failed' });
    }
  }
);

// Export restoreSession as getCurrentUser for backward compatibility
export const getCurrentUser = restoreSession;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
    },
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.success = true;
        state.message = action.payload.message || 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to login';
        state.success = false;
        state.message = '';
      })
      // Microsoft Auth
      .addCase(microsoftAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(microsoftAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.success = true;
        state.message = action.payload.message || 'Microsoft authentication successful';
      })
      .addCase(microsoftAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Microsoft authentication failed';
        state.success = false;
        state.message = '';
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload?.error || 'Failed to refresh token';
      })
      // Restore Session
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload?.error || 'Session restoration failed';
      });
  },
});

export const { logout, resetAuthState, clearError } = authSlice.actions;

// Create and export auth selector
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;