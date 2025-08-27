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

// Configure axios for multipart form data
const configureMultipartAxiosInstance = () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Upload documents
export const uploadDocuments = createAsyncThunk(
  'leave/uploadDocuments',
  async (files, { rejectWithValue }) => {
    try {
      const api = configureMultipartAxiosInstance();
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await api.post('/documents/upload', formData);
      return response.data.documentIds; // Assuming API returns { documentIds: [] }
    } catch (error) {
      console.error('Upload documents error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to upload documents' });
    }
  }
);

// Fetch all leave types
export const fetchLeaveTypes = createAsyncThunk(
  'leave/fetchLeaveTypes',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/leaves/types');
      return response.data;
    } catch (error) {
      console.error('Fetch leave types error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch leave types' });
    }
  }
);

// Fetch user leave balances
export const fetchUserLeaveBalances = createAsyncThunk(
  'leave/fetchUserLeaveBalances',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/leaves/balances');
      return response.data;
    } catch (error) {
      console.error('Fetch leave balances error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch leave balances' });
    }
  }
);

// Fetch user leave requests
export const fetchUserLeaveRequests = createAsyncThunk(
  'leave/fetchUserLeaveRequests',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/leaves/requests');
      return response.data;
    } catch (error) {
      console.error('Fetch leave requests error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch leave requests' });
    }
  }
);

// Create leave request with documents
export const createLeaveRequestWithDocuments = createAsyncThunk(
  'leave/createLeaveRequestWithDocuments',
  async ({ leaveRequest, files }, { dispatch, rejectWithValue }) => {
    try {
      let documentIds = [];
      
      // Upload documents if files are provided
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadDocuments(files)).unwrap();
        documentIds = uploadResult;
      }

      // Update leave request with document IDs
      const updatedLeaveRequest = {
        ...leaveRequest,
        documentIds
      };

      const api = configureAxiosInstance();
      const response = await api.post('/leaves/requests', updatedLeaveRequest);
      return response.data;
    } catch (error) {
      console.error('Create leave request with documents error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create leave request' });
    }
  }
);

// Create leave request without documents
export const createLeaveRequest = createAsyncThunk(
  'leave/createLeaveRequest',
  async (leaveRequestData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.post('/leaves/requests', leaveRequestData);
      return response.data;
    } catch (error) {
      console.error('Create leave request error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create leave request' });
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    leaveTypes: [],
    leaveBalances: [],
    leaveRequests: [],
    isLoading: false,
    isCreating: false,
    success: false,
    error: null,
    message: null
  },
  reducers: {
    resetLeaveState: (state) => {
      state.isCreating = false;
      state.success = false;
      state.error = null;
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Leave Types
    builder
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaveTypes = action.payload;
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.error;
      });

    // Fetch User Leave Balances
    builder
      .addCase(fetchUserLeaveBalances.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserLeaveBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaveBalances = action.payload;
      })
      .addCase(fetchUserLeaveBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.error;
      });

    // Fetch User Leave Requests
    builder
      .addCase(fetchUserLeaveRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserLeaveRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaveRequests = action.payload;
      })
      .addCase(fetchUserLeaveRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.error;
      });

    // Upload Documents
    builder
      .addCase(uploadDocuments.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(uploadDocuments.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload.error;
      });

    // Create Leave Request
    builder
      .addCase(createLeaveRequest.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.isCreating = false;
        state.success = true;
        state.message = 'Leave request created successfully';
        state.leaveRequests.push(action.payload);
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload.error;
      });

    // Create Leave Request with Documents
    builder
      .addCase(createLeaveRequestWithDocuments.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createLeaveRequestWithDocuments.fulfilled, (state, action) => {
        state.isCreating = false;
        state.success = true;
        state.message = 'Leave request created successfully';
        state.leaveRequests.push(action.payload);
      })
      .addCase(createLeaveRequestWithDocuments.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload.error;
      });
  }
});

export const { resetLeaveState } = leaveSlice.actions;

export const selectLeave = (state) => state.leave;

export default leaveSlice.reducer;