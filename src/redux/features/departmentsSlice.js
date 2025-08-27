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

// Fetch all departments
export const fetchAllDepartments = createAsyncThunk(
  'departments/fetchAllDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      console.error('Fetch departments error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch departments' });
    }
  }
);

// Fetch department by ID
export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchDepartmentById',
  async (id, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Fetch department error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch department' });
    }
  }
);

// Create new department
export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (departmentData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      console.error('Create department error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create department' });
    }
  }
);

// Update department
export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, departmentData }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.put(`/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      console.error('Update department error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to update department' });
    }
  }
);

// Delete department
export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      await api.delete(`/departments/${id}`);
      return id; // Return the id to remove it from state
    } catch (error) {
      console.error('Delete department error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to delete department' });
    }
  }
);

// Fetch departments by head ID
export const fetchDepartmentsByHead = createAsyncThunk(
  'departments/fetchDepartmentsByHead',
  async (headId, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get(`/departments/by-head/${headId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch departments by head error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch departments by head' });
    }
  }
);

export const assignDepartmentHead = createAsyncThunk(
  'departments/assignDepartmentHead',
  async ({ departmentId, headId }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.put(`/departments/${departmentId}/head?headId=${headId}`);
      return response.data;
    } catch (error) {
      console.error('Assign department head error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to assign department head' });
    }
  }
);

export const removeDepartmentHead = createAsyncThunk(
  'departments/removeDepartmentHead',
  async (departmentId, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.delete(`/departments/${departmentId}/head`);
      return response.data;
    } catch (error) {
      console.error('Remove department head error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to remove department head' });
    }
  }
);

const departmentsSlice = createSlice({
  name: 'departments',
  initialState: {
    departments: [],
    currentDepartment: null,
    loading: false,
    error: null,
    success: false,
    message: '',
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isAuthenticated: !!getAuthToken()
  },
  reducers: {
    resetDepartmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
    },
    clearDepartmentError: (state) => {
      state.error = null;
    },
    setCurrentDepartment: (state, action) => {
      state.currentDepartment = action.payload;
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Departments
      .addCase(fetchAllDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchAllDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch departments';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Fetch Department by ID
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch department';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Create Department
      .addCase(createDepartment.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.departments.push(action.payload);
        state.success = true;
        state.message = 'Department created successfully';
        state.isAuthenticated = true;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.error || 'Failed to create department';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Update Department
      .addCase(updateDepartment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.departments.findIndex(dept => dept.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        state.currentDepartment = action.payload;
        state.success = true;
        state.message = 'Department updated successfully';
        state.isAuthenticated = true;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.error || 'Failed to update department';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Delete Department
      .addCase(deleteDepartment.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.departments = state.departments.filter(dept => dept.id !== action.payload);
        state.success = true;
        state.message = 'Department deleted successfully';
        if (state.currentDepartment && state.currentDepartment.id === action.payload) {
          state.currentDepartment = null;
        }
        state.isAuthenticated = true;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.error || 'Failed to delete department';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })

      .addCase(assignDepartmentHead.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(assignDepartmentHead.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.departments.findIndex(dept => dept.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        state.currentDepartment = action.payload;
        state.success = true;
        state.message = 'Department head assigned successfully';
        state.isAuthenticated = true;
      })
      .addCase(assignDepartmentHead.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.error || 'Failed to assign department head';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Remove Department Head
      .addCase(removeDepartmentHead.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(removeDepartmentHead.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.departments.findIndex(dept => dept.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        state.currentDepartment = action.payload;
        state.success = true;
        state.message = 'Department head removed successfully';
        state.isAuthenticated = true;
      })
      .addCase(removeDepartmentHead.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.error || 'Failed to remove department head';
        state.success = false;
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })

      
      // Fetch Departments By Head
      .addCase(fetchDepartmentsByHead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentsByHead.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchDepartmentsByHead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch departments by head';
        
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      });

     
     


      
  }
});

export const { 
  resetDepartmentState, 
  clearDepartmentError,
  setCurrentDepartment,
  clearCurrentDepartment
} = departmentsSlice.actions;

// Create and export departments selector
export const selectDepartments = (state) => state.departments;

export default departmentsSlice.reducer;