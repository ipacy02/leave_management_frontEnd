import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL;

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
  

// Fetch employee leave statistics
 // Add debugging to see what's happening with the API calls
export const fetchEmployeeStatistics = createAsyncThunk(
    'reports/fetchEmployeeStatistics',
    async ({ userId, startDate, endDate }, { rejectWithValue }) => {
      try {
        console.log('Fetching employee statistics with:', { userId, startDate, endDate });
        const api = configureAxiosInstance();
        
        // Log the actual request URL and headers
        console.log('API URL:', `${API_URL}/reports/employee/statistics`);
        console.log('Token:', getAuthToken());
        
        let url = '/reports/employee/statistics';
        
        // If userId is provided and it's not the current user, use the admin endpoint
        if (userId) {
          url = `/reports/employee/${userId}/statistics`;
        }
        
        // Add detailed logging
        console.log('Making request to:', url);
        
        const response = await api.get(url, {
          params: { startDate, endDate }
        });
        
        console.log('Response received:', response.data);
        return response.data;
      } catch (error) {
        console.error('Fetch employee statistics error:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Error status:', error.response?.status);
        
        if (error.response?.status === 401) {
          return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
        }
        return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch employee statistics' });
      }
    }
  );
// Fetch department leave statistics
export const fetchDepartmentStatistics = createAsyncThunk(
  'reports/fetchDepartmentStatistics',
  async ({ departmentId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get(`/reports/department/${departmentId}/statistics`, {
        params: { startDate, endDate }
      });
      
      return response.data;
    } catch (error) {
      console.error('Fetch department statistics error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to access this resource.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch department statistics' });
    }
  }
);

// Fetch leave type statistics
export const fetchLeaveTypeStatistics = createAsyncThunk(
  'reports/fetchLeaveTypeStatistics',
  async ({ leaveTypeId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get(`/reports/leave-type/${leaveTypeId}/statistics`, {
        params: { startDate, endDate }
      });
      
      return response.data;
    } catch (error) {
      console.error('Fetch leave type statistics error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to access this resource.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch leave type statistics' });
    }
  }
);

// Fetch company-wide leave statistics
export const fetchCompanyStatistics = createAsyncThunk(
  'reports/fetchCompanyStatistics',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get('/reports/company/statistics', {
        params: { startDate, endDate }
      });
      
      return response.data;
    } catch (error) {
      console.error('Fetch company statistics error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to access this resource.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch company statistics' });
    }
  }
);

// Fetch detailed report data
export const fetchReportData = createAsyncThunk(
  'reports/fetchReportData',
  async ({ reportType, entityId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      let url;
      
      if (reportType === 'COMPANY') {
        url = '/reports/company/data';
      } else {
        url = `/reports/${reportType.toLowerCase()}/${entityId}/data`;
      }
      
      const response = await api.get(url, {
        params: { startDate, endDate }
      });
      
      return response.data;
    } catch (error) {
      console.error('Fetch report data error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to access this resource.' });
      }
      return rejectWithValue(error.response?.data || { error: error.message || 'Failed to fetch report data' });
    }
  }
);

export const exportReportToCsv = createAsyncThunk(
  'reports/exportToCsv',
  async ({ reportType, entityId, startDate, endDate }, { rejectWithValue, getState }) => {
    try {
      const api = configureAxiosInstance();
      
      // Reuse the report data if already loaded
      const { reportData } = getState().reports;
      
      // If we already have the report data, format it to CSV on the client side
      if (reportData && reportData.length > 0) {
        // Create CSV header
        let csv = 'Employee Name,Email,Department,Leave Type,Start Date,End Date,Status,Duration,Reason,Comments\n';
        
        // Add data rows
        reportData.forEach(item => {
          const escapeCsv = (text) => {
            if (!text) return '';
            // Escape quotes and wrap in quotes
            return `"${String(text).replace(/"/g, '""')}"`;
          };
          
          csv += 
            `${escapeCsv(item.employeeName)},` +
            `${escapeCsv(item.employeeEmail)},` +
            `${escapeCsv(item.departmentName)},` +
            `${escapeCsv(item.leaveTypeName)},` +
            `${escapeCsv(item.startDate)},` +
            `${escapeCsv(item.endDate)},` +
            `${escapeCsv(item.status)},` +
            `${escapeCsv(item.duration)},` +
            `${escapeCsv(item.reason)},` +
            `${escapeCsv(item.comments)}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set file name based on report type
        let fileName;
        switch (reportType) {
          case 'EMPLOYEE':
            fileName = 'employee_leave_report.csv';
            break;
          case 'DEPARTMENT':
            fileName = 'department_leave_report.csv';
            break;
          case 'LEAVE_TYPE':
            fileName = 'leave_type_report.csv';
            break;
          case 'COMPANY':
            fileName = 'company_leave_report.csv';
            break;
          default:
            fileName = 'leave_report.csv';
        }
        
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true, message: 'CSV export completed successfully' };
      } 
      // Otherwise, request CSV from server
      else {
        // Fetch the report data first
        let url;
        
        if (reportType === 'COMPANY') {
          url = '/reports/company/data';
        } else {
          url = `/reports/${reportType.toLowerCase()}/${entityId}/data`;
        }
        
        const response = await api.get(url, {
          params: { startDate, endDate }
        });
        
        const data = response.data;
        
        // Create CSV from fetched data
        let csv = 'Employee Name,Email,Department,Leave Type,Start Date,End Date,Status,Duration,Reason,Comments\n';
        
        // Add data rows
        data.forEach(item => {
          const escapeCsv = (text) => {
            if (!text) return '';
            // Escape quotes and wrap in quotes
            return `"${String(text).replace(/"/g, '""')}"`;
          };
          
          csv += 
            `${escapeCsv(item.employeeName)},` +
            `${escapeCsv(item.employeeEmail)},` +
            `${escapeCsv(item.departmentName)},` +
            `${escapeCsv(item.leaveTypeName)},` +
            `${escapeCsv(item.startDate)},` +
            `${escapeCsv(item.endDate)},` +
            `${escapeCsv(item.status)},` +
            `${escapeCsv(item.duration)},` +
            `${escapeCsv(item.reason)},` +
            `${escapeCsv(item.comments)}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set file name based on report type
        let fileName;
        switch (reportType) {
          case 'EMPLOYEE':
            fileName = 'employee_leave_report.csv';
            break;
          case 'DEPARTMENT':
            fileName = 'department_leave_report.csv';
            break;
          case 'LEAVE_TYPE':
            fileName = 'leave_type_report.csv';
            break;
          case 'COMPANY':
            fileName = 'company_leave_report.csv';
            break;
          default:
            fileName = 'leave_report.csv';
        }
        
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true, message: 'CSV export completed successfully' };
      }
    } catch (error) {
      console.error('Export to CSV error:', error);
      return rejectWithValue({ error: error.message || 'Failed to export report to CSV' });
    }
  }
);

// Export report to Excel - Client-side implementation
export const exportReportToExcel = createAsyncThunk(
  'reports/exportToExcel',
  async ({ reportType, entityId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      
      let url;
      if (reportType === 'COMPANY') {
        url = '/reports/company/data';
      } else {
        url = `/reports/${reportType.toLowerCase()}/${entityId}/data`;
      }
      
      await api.get(url, {
        params: { startDate, endDate }
      });
      
      // Return a message since this functionality needs backend implementation
      return { 
        success: true, 
        message: 'Excel export requires server-side implementation. Please implement the Excel export endpoint in your ReportExportService.' 
      };
    } catch (error) {
      console.error('Export to Excel error:', error);
      return rejectWithValue({ error: error.message || 'Failed to export report to Excel' });
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    statistics: null,
    reportData: null,
    loading: false,
    exportLoading: false,
    error: null,
    success: false,
    message: ''
  },
  reducers: {
    resetReportState: (state) => {
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearReportData: (state) => {
      state.statistics = null;
      state.reportData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle Employee Statistics
      .addCase(fetchEmployeeStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchEmployeeStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch employee statistics';
      })
      
      // Handle Department Statistics
      .addCase(fetchDepartmentStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchDepartmentStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch department statistics';
      })
      
      // Handle Leave Type Statistics
      .addCase(fetchLeaveTypeStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveTypeStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchLeaveTypeStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch leave type statistics';
      })
      
      // Handle Company Statistics
      .addCase(fetchCompanyStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchCompanyStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch company statistics';
      })
      
      // Handle Report Data
      .addCase(fetchReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch report data';
      })
      
      // Handle CSV Export
      .addCase(exportReportToCsv.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportReportToCsv.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportReportToCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload?.error || 'Failed to export report';
      })
      
      // Handle Excel Export
      .addCase(exportReportToExcel.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportReportToExcel.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportReportToExcel.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload?.error || 'Failed to export report';
      });
  }
});

export const { resetReportState, clearReportData } = reportSlice.actions;

// Create and export reports selector
export const selectReports = (state) => state.reports;

export default reportSlice.reducer;