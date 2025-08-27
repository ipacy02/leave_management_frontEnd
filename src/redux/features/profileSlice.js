import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
// Note: VITE_API_URL already includes /api/v1, so we don't need to add it again

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

// Get user profile data
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/user-profile');
      return response.data;
    } catch (error) {
      console.error('Fetch profile error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Session might have expired
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch profile' });
    }
  }
);

// Update user profile information
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.put('/user-profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to update profile' });
    }
  }
);

// Upload profile image
export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (imageFile, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Make sure we're handling a file
      if (!(imageFile instanceof File)) {
        throw new Error('Invalid file');
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', imageFile);
      
      // For file uploads we need to set the content type to multipart/form-data
      const response = await axios.post(`${API_URL}/user-profile/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Upload profile image error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to upload profile image' });
    }
  }
);

// Delete profile image
export const deleteProfileImage = createAsyncThunk(
  'profile/deleteProfileImage',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.delete('/user-profile/image');
      return response.data;
    } catch (error) {
      console.error('Delete profile image error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to delete profile image' });
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.put('/user-profile/password', null, {
        params: { currentPassword, newPassword }
      });
      
      return response.data;
    } catch (error) {
      console.error('Change password error:', error.response?.data || error.message);
      
      // Handle specific error codes
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      } else if (error.response?.status === 400) {
        return rejectWithValue({ error: 'Current password is incorrect' });
      }
      
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to change password' });
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    userData: null,
    loading: false,
    error: null,
    success: false,
    message: '',
    imageUploading: false,
    passwordChanging: false,
    isAuthenticated: !!getAuthToken(), // Track authentication status
  },
  reducers: {
    resetProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    // Reset profile when user logs out
    clearUserProfile: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
      state.imageUploading = false;
      state.passwordChanging = false;
      state.isAuthenticated = false;
    },
    // Set authentication status
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.success = true;
        state.message = 'Profile fetched successfully';
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch profile';
        state.success = false;
        state.message = '';
        
        // If unauthorized, mark as not authenticated
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.success = true;
        state.message = 'Profile updated successfully';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update profile';
        state.success = false;
        state.message = '';
        
        // If unauthorized, mark as not authenticated
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Upload Profile Image
      .addCase(uploadProfileImage.pending, (state) => {
        state.imageUploading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.imageUploading = false;
        // Update the profile image URL in the userData
        if (state.userData) {
          state.userData = action.payload;
        }
        state.success = true;
        state.message = 'Profile image uploaded successfully';
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.imageUploading = false;
        state.error = action.payload?.error || 'Failed to upload profile image';
        state.success = false;
        state.message = '';
        
        // If unauthorized, mark as not authenticated
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Delete Profile Image
      .addCase(deleteProfileImage.pending, (state) => {
        state.imageUploading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(deleteProfileImage.fulfilled, (state, action) => {
        state.imageUploading = false;
        // Update the profile data with the returned user object
        state.userData = action.payload;
        state.success = true;
        state.message = 'Profile image deleted successfully';
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.imageUploading = false;
        state.error = action.payload?.error || 'Failed to upload profile image';
        state.success = false;
        state.message = '';
        
        // If unauthorized, mark as not authenticated
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.passwordChanging = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordChanging = false;
        state.success = true;
        state.message = 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChanging = false;
        state.error = action.payload?.error || 'Failed to change password';
        state.success = false;
        state.message = '';
        
        // If unauthorized, mark as not authenticated
        if (action.payload?.error === 'Your session has expired. Please log in again.') {
          state.isAuthenticated = false;
        }
      });
  },
});

export const { 
  resetProfileState, 
  clearProfileError, 
  clearUserProfile,
  setAuthenticated 
} = profileSlice.actions;

// Create and export profile selector
export const selectProfile = (state) => state.profile;

export default profileSlice.reducer;