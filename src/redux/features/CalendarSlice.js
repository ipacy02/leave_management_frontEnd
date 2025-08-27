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

// Add a cancelation token source object to track and cancel previous requests
let calendarRequestController = null;

// Get calendar events within a date range
export const fetchCalendarEvents = createAsyncThunk(
  'calendar/fetchEvents',
  async ({ startTime, endTime }, { rejectWithValue }) => {
    // Cancel any in-progress requests
    if (calendarRequestController) {
      calendarRequestController.abort();
    }
    
    // Create a new AbortController
    calendarRequestController = new AbortController();
    
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/calendar/events', {
        params: { 
          startTime: startTime.toISOString(), 
          endTime: endTime.toISOString() 
        },
        signal: calendarRequestController.signal
      });
      
      return response.data;
    } catch (error) {
      // Check if this was an abort error (request canceled)
      if (error.name === 'AbortError' || axios.isCancel(error)) {
        return rejectWithValue({ error: 'Request was canceled' });
      }
      
      console.error('Fetch calendar events error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch calendar events' });
    } finally {
      calendarRequestController = null;
    }
  }
);

// Track holiday requests
let holidayRequestController = null;

// Get holidays within a date range
export const fetchHolidays = createAsyncThunk(
  'calendar/fetchHolidays',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    // Cancel any in-progress requests
    if (holidayRequestController) {
      holidayRequestController.abort();
    }
    
    // Create a new AbortController
    holidayRequestController = new AbortController();
    
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get('/calendar/holidays', {
        params: { 
          startDate: startDate.toISOString().split('T')[0], 
          endDate: endDate.toISOString().split('T')[0] 
        },
        signal: holidayRequestController.signal
      });
      
      return response.data;
    } catch (error) {
      // Check if this was an abort error (request canceled)
      if (error.name === 'AbortError' || axios.isCancel(error)) {
        return rejectWithValue({ error: 'Request was canceled' });
      }
      
      console.error('Fetch holidays error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch holidays' });
    } finally {
      holidayRequestController = null;
    }
  }
);

// Create a calendar event
export const createCalendarEvent = createAsyncThunk(
  'calendar/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.post('/calendar/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Create calendar event error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create calendar event' });
    }
  }
);

export const createHoliday = createAsyncThunk(
  'calendar/createHoliday',
  async (holidayData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.post('/calendar/holidays', holidayData);
      return response.data;
    } catch (error) {
      console.error('Create holiday error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to create holiday' });
    }
  }
);

// Update a calendar event
export const updateCalendarEvent = createAsyncThunk(
  'calendar/updateEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const { id, ...eventDetails } = eventData;
      const response = await api.put(`/calendar/events/${id}`, eventDetails);
      
      return response.data;
    } catch (error) {
      console.error('Update calendar event error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to update calendar event' });
    }
  }
);

// Delete a calendar event
export const deleteCalendarEvent = createAsyncThunk(
  'calendar/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      await api.delete(`/calendar/events/${eventId}`);
      return eventId;
    } catch (error) {
      console.error('Delete calendar event error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to delete calendar event' });
    }
  }
);

// Get team calendar data
export const fetchTeamCalendar = createAsyncThunk(
  'calendar/fetchTeamCalendar',
  async ({ departmentId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      const response = await api.get(`/calendar/team/${departmentId}`, {
        params: { 
          startDate: startDate.toISOString().split('T')[0], 
          endDate: endDate.toISOString().split('T')[0] 
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Fetch team calendar error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch team calendar' });
    }
  }
);

// Sync with Outlook calendar
export const syncOutlookCalendar = createAsyncThunk(
  'calendar/syncOutlook',
  async (_, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      await api.post('/calendar/sync/outlook');
      return true;
    } catch (error) {
      console.error('Sync Outlook calendar error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to sync with Outlook calendar' });
    }
  }
);

const initialState = {
  events: [],
  holidays: [],
  teamCalendar: {
    teamLeaves: [],
    holidays: []
  },
  loading: false,
  eventsLoading: false,
  holidaysLoading: false,
  teamCalendarLoading: false,
  syncingOutlook: false,
  error: null,
  success: false,
  message: ''
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    resetCalendarState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearCalendarError: (state) => {
      state.error = null;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Calendar Events
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.eventsLoading = true;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        // Don't set error for canceled requests
        if (action.payload?.error !== 'Request was canceled') {
          state.error = action.payload?.error || 'Failed to fetch calendar events';
        }
      })
      
      // Create Calendar Event
      .addCase(createCalendarEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = [...state.holidays, action.payload];
        state.success = true;
        state.message = 'Holiday created successfully';
        state.error = null;
      })
      .addCase(createHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create holiday';
        state.success = false;
      })
      
      .addCase(createCalendarEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = [...state.events, action.payload];
        state.success = true;
        state.message = 'Event created successfully';
        state.error = null;
      })
      .addCase(createCalendarEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create calendar event';
        state.success = false;
      })
      
      // Update Calendar Event
      .addCase(updateCalendarEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCalendarEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        );
        state.success = true;
        state.message = 'Event updated successfully';
        state.error = null;
      })
      .addCase(updateCalendarEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update calendar event';
        state.success = false;
      })
      
      // Delete Calendar Event
      .addCase(deleteCalendarEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCalendarEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
        state.success = true;
        state.message = 'Event deleted successfully';
        state.error = null;
      })
      .addCase(deleteCalendarEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete calendar event';
        state.success = false;
      })
      
      // Fetch Holidays
      .addCase(fetchHolidays.pending, (state) => {
        state.holidaysLoading = true;
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.holidaysLoading = false;
        state.holidays = action.payload;
        state.error = null;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.holidaysLoading = false;
        // Don't set error for canceled requests
        if (action.payload?.error !== 'Request was canceled') {
          state.error = action.payload?.error || 'Failed to fetch holidays';
        }
      })
      
      // Fetch Team Calendar
      .addCase(fetchTeamCalendar.pending, (state) => {
        state.teamCalendarLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamCalendar.fulfilled, (state, action) => {
        state.teamCalendarLoading = false;
        state.teamCalendar = action.payload;
        state.error = null;
      })
      .addCase(fetchTeamCalendar.rejected, (state, action) => {
        state.teamCalendarLoading = false;
        state.error = action.payload?.error || 'Failed to fetch team calendar';
      })
      
      // Sync Outlook Calendar
      .addCase(syncOutlookCalendar.pending, (state) => {
        state.syncingOutlook = true;
        state.error = null;
        state.success = false;
      })
      .addCase(syncOutlookCalendar.fulfilled, (state) => {
        state.syncingOutlook = false;
        state.success = true;
        state.message = 'Outlook calendar synced successfully';
        state.error = null;
      })
      .addCase(syncOutlookCalendar.rejected, (state, action) => {
        state.syncingOutlook = false;
        state.error = action.payload?.error || 'Failed to sync with Outlook calendar';
        state.success = false;
      });
  }
});

export const { 
  resetCalendarState,
  clearCalendarError,
  setSelectedDate,
  setDateRange
} = calendarSlice.actions;

// Create and export calendar selector
export const selectCalendar = (state) => state.calendar;

export default calendarSlice.reducer;