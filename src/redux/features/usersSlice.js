import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Helper function to get auth token from storage
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Async thunk for creating a user
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Create user error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create user' });
    }
  }
);

// Async thunk for fetching a user by ID
export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get user error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch user' });
    }
  }
);

// Async thunk for fetching a user by email
export const getUserByEmail = createAsyncThunk(
  'users/getUserByEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/email/${email}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get user by email error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch user by email' });
    }
  }
);

// Async thunk for updating a user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to update user' });
    }
  }
);

// Async thunk for deleting a user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return userId;
    } catch (error) {
      console.error('Delete user error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to delete user' });
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'users/changePassword',
  async ({ userId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/users/${userId}/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Change password error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to change password' });
    }
  }
);

// Async thunk for fetching all users
export const getAllUsers = createAsyncThunk(
  'users/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch users' });
    }
  }
);

// Async thunk for fetching users by manager (my team)
export const getMyTeam = createAsyncThunk(
  'users/getMyTeam',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/my-team`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get my team error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch your team' });
    }
  }
);

// Async thunk for fetching users by department
export const getUsersByDepartment = createAsyncThunk(
  'users/getUsersByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/department/${departmentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get users by department error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch users by department' });
    }
  }
);

// Async thunk for fetching users by role
export const getUsersByRole = createAsyncThunk(
  'users/getUsersByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/role/${role}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get users by role error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch users by role' });
    }
  }
);

// Async thunk for searching users
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/search?searchTerm=${searchTerm}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to search users' });
    }
  }
);

// Async thunk for fetching all managers
export const getAllManagers = createAsyncThunk(
  'users/getAllManagers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/managers`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get all managers error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch managers' });
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentUser: null,
    managers: [],
    loading: false,
    error: null,
    success: false,
    message: '',
    myTeam: [],
    usersByDepartment: {},
    usersByRole: {},
    searchResults: []
  },
  reducers: {
    resetUsersState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearUsersError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.success = true;
        state.message = 'User created successfully';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create user';
      })
      
      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch user';
      })
      
      // Get User By Email
      .addCase(getUserByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserByEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getUserByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch user by email';
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'User updated successfully';
        
        // Update user in users array
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        
        // Update currentUser if it's the same user
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update user';
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.success = true;
        state.message = 'User deleted successfully';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete user';
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to change password';
      })
      
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch users';
      })
      
      // Get My Team
      .addCase(getMyTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeam = action.payload;
      })
      .addCase(getMyTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch your team';
      })
      
      // Get Users By Department
      .addCase(getUsersByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.usersByDepartment = {
          ...state.usersByDepartment,
          [action.meta.arg]: action.payload
        };
      })
      .addCase(getUsersByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch users by department';
      })
      
      // Get Users By Role
      .addCase(getUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.usersByRole = {
          ...state.usersByRole,
          [action.meta.arg]: action.payload
        };
      })
      .addCase(getUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch users by role';
      })
      
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to search users';
      })
      
      // Get All Managers
      .addCase(getAllManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.managers = action.payload;
      })
      .addCase(getAllManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch managers';
      });
  }
});

export const { resetUsersState, clearUsersError, setCurrentUser } = usersSlice.actions;

// Selectors
export const selectUsers = (state) => state.users;
export const selectCurrentUser = (state) => state.users.currentUser;

export default usersSlice.reducer;