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

// Create leave request with documents
 
export const createLeaveRequestWithDocuments = createAsyncThunk(
  'leave/createLeaveRequestWithDocuments',
  async ({ leaveRequest, files }, { rejectWithValue }) => {
    try {
      const api = configureMultipartAxiosInstance();
      
      const formData = new FormData();
      formData.append('leaveRequest', new Blob([JSON.stringify(leaveRequest)], { type: 'application/json' }));
      
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }
      
      // Change this line to use the correct endpoint
      const response = await api.post('/leaves/requests/with-documents', formData);
      return response.data;
    } catch (error) {
      console.error('Create leave request with documents error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create leave request with documents' });
    }
  }
);

// Get leave request by ID
export const getLeaveRequestById = createAsyncThunk(
  'leave/getLeaveRequestById',
  async (requestId, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get(`/leaves/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Get leave request error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to get leave request' });
    }
  }
);

// Update leave request status (for approvers)
export const updateLeaveRequestStatus = createAsyncThunk(
  'leave/updateLeaveRequestStatus',
  async ({ requestId, updateData }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.put(`/leaves/requests/${requestId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update leave request status error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to update leave request status' });
    }
  }
);

// Get pending approvals (for approvers)
export const getPendingApprovals = createAsyncThunk(
  'leave/getPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/leaves/approvals');
      return response.data;
    } catch (error) {
      console.error('Get pending approvals error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to get pending approvals' });
    }
  }
);

// Adjust leave balance (for admins)
export const adjustLeaveBalance = createAsyncThunk(
  'leave/adjustLeaveBalance',
  async (adjustmentData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.post('/leaves/balances/adjust', adjustmentData);
      return response.data;
    } catch (error) {
      console.error('Adjust leave balance error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to adjust leave balance' });
    }
  }
);

// Create leave type (for admins)
export const createLeaveType = createAsyncThunk(
  'leave/createLeaveType',
  async (leaveTypeData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.post('/leaves/types', leaveTypeData);
      return response.data;
    } catch (error) {
      console.error('Create leave type error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create leave type' });
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    leaveTypes: [],
    leaveBalances: [],
    leaveRequests: [],
    pendingApprovals: [],
    currentLeaveRequest: null,
    loading: false,
    error: null,
    success: false,
    message: '',
    isCreating: false,
    isUpdating: false,
    isAuthenticated: !!getAuthToken()
  },
  reducers: {
    resetLeaveState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
      state.isCreating = false;
      state.isUpdating = false;
    },
    clearLeaveError: (state) => {
      state.error = null;
    },
    setCurrentLeaveRequest: (state, action) => {
      state.currentLeaveRequest = action.payload;
    },
    clearCurrentLeaveRequest: (state) => {
      state.currentLeaveRequest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch leave types
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch leave types';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Fetch user leave balances
      .addCase(fetchUserLeaveBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLeaveBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveBalances = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserLeaveBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch leave balances';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Fetch user leave requests
      .addCase(fetchUserLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveRequests = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch leave requests';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Create leave request
      .addCase(createLeaveRequest.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.isCreating = false;
        state.leaveRequests.push(action.payload);
        state.currentLeaveRequest = action.payload;
        state.success = true;
        state.message = 'Leave request created successfully';
        state.isAuthenticated = true;
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.error || 'Failed to create leave request';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })

      // Create leave type
.addCase(createLeaveType.pending, (state) => {
  state.isCreating = true;
  state.error = null;
  state.success = false;
  state.message = '';
})
.addCase(createLeaveType.fulfilled, (state, action) => {
  state.isCreating = false;
  state.leaveTypes.push(action.payload);
  state.success = true;
  state.message = 'Leave type created successfully';
  state.isAuthenticated = true;
})
.addCase(createLeaveType.rejected, (state, action) => {
  state.isCreating = false;
  state.error = action.payload?.error || 'Failed to create leave type';
  state.success = false;
  
  if (action.payload?.error === 'Your session has expired. Please log in again.') {
    state.isAuthenticated = false;
  }
})
      
      // Create leave request with documents
      .addCase(createLeaveRequestWithDocuments.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(createLeaveRequestWithDocuments.fulfilled, (state, action) => {
        state.isCreating = false;
        state.leaveRequests.push(action.payload);
        state.currentLeaveRequest = action.payload;
        state.success = true;
        state.message = 'Leave request created successfully with documents';
        state.isAuthenticated = true;
      })
      .addCase(createLeaveRequestWithDocuments.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.error || 'Failed to create leave request with documents';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Get leave request by ID
      .addCase(getLeaveRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeaveRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeaveRequest = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getLeaveRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get leave request';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Update leave request status
      .addCase(updateLeaveRequestStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(updateLeaveRequestStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        // Update in leave requests list if present
        const index = state.leaveRequests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.leaveRequests[index] = action.payload;
        }
        
        // Update in pending approvals list if present
        const approvalIndex = state.pendingApprovals.findIndex(req => req.id === action.payload.id);
        if (approvalIndex !== -1) {
          // If status is no longer pending, remove from pending approvals
          if (action.payload.status !== 'PENDING') {
            state.pendingApprovals = state.pendingApprovals.filter(req => req.id !== action.payload.id);
          } else {
            state.pendingApprovals[approvalIndex] = action.payload;
          }
        }
        
        state.currentLeaveRequest = action.payload;
        state.success = true;
        state.message = `Leave request ${action.payload.status.toLowerCase()}`;
        state.isAuthenticated = true;
      })
      .addCase(updateLeaveRequestStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.error || 'Failed to update leave request status';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Get pending approvals
      .addCase(getPendingApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getPendingApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get pending approvals';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Adjust leave balance
      .addCase(adjustLeaveBalance.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(adjustLeaveBalance.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        // Update the balance in the list if it exists
        const index = state.leaveBalances.findIndex(
          balance => balance.id === action.payload.id
        );
        
        if (index !== -1) {
          state.leaveBalances[index] = action.payload;
        } else {
          state.leaveBalances.push(action.payload);
        }
        
        state.success = true;
        state.message = 'Leave balance adjusted successfully';
        state.isAuthenticated = true;
      })
      .addCase(adjustLeaveBalance.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.error || 'Failed to adjust leave balance';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      });
  }
});

export const { 
  resetLeaveState, 
  clearLeaveError,
  setCurrentLeaveRequest,
  clearCurrentLeaveRequest
} = leaveSlice.actions;

 
export const selectLeave = (state) => state.leave;

export default leaveSlice.reducer;