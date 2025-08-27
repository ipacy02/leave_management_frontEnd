import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authReducer from '../features/authSlice';
import profileReducer from '../features/profileSlice';
import departmentsReducer from '../features/departmentsSlice';
import usersReducer from '../features/usersSlice';
import calendarReducer from '../features/CalendarSlice';
import leaveReducer from '../features/leaveFeature'; // Import the leave reducer from the pasted file
import notificationReducer from '../features/NotificationSlice';
import reportReducer from "../features/ReportsSlice";
import reportExportReducer from '../features/AdminReporting';
import documentReducer from '../features/DocumentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    calendar: calendarReducer,
    departments: departmentsReducer,
    users: usersReducer,
    notifications: notificationReducer,
    leave: leaveReducer,
    document: documentReducer,
    reports: reportReducer,
    reportExport: reportExportReducer,
     // Add the leave reducer to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
});

export default store;