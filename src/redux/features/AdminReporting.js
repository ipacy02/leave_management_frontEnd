import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

const configureAxiosInstance = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// Export report to CSV for specific entity
export const exportEntityReportToCsv = createAsyncThunk(
  'reportExport/exportEntityReportToCsv',
  async ({ reportType, entityId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get(`/reports/export/${reportType.toLowerCase()}/${entityId}/csv`, {
        params: { startDate, endDate },
        responseType: 'text',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `leave_report_${reportType.toLowerCase()}_${entityId}_${startDate}_${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'CSV report exported successfully' };
    } catch (error) {
      console.error('Export entity CSV error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to export this report.' });
      }
      return rejectWithValue({ error: error.message || 'Failed to export CSV report' });
    }
  }
);

// Export report to Excel for specific entity
export const exportEntityReportToExcel = createAsyncThunk(
  'reportExport/exportEntityReportToExcel',
  async ({ reportType, entityId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get(`/reports/export/${reportType.toLowerCase()}/${entityId}/excel`, {
        params: { startDate, endDate },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `leave_report_${reportType.toLowerCase()}_${entityId}_${startDate}_${endDate}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'Excel report exported successfully' };
    } catch (error) {
      console.error('Export entity Excel error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to export this report.' });
      }
      return rejectWithValue({ error: error.message || 'Failed to export Excel report' });
    }
  }
);

// Export company-wide report to CSV
export const exportCompanyReportToCsv = createAsyncThunk(
  'reportExport/exportCompanyReportToCsv',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get('/reports/export/company/csv', {
        params: { startDate, endDate },
        responseType: 'text',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `company_leave_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'Company CSV report exported successfully' };
    } catch (error) {
      console.error('Export company CSV error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to export company reports.' });
      }
      return rejectWithValue({ error: error.message || 'Failed to export company CSV report' });
    }
  }
);

// Export company-wide report to Excel
export const exportCompanyReportToExcel = createAsyncThunk(
  'reportExport/exportCompanyReportToExcel',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get('/reports/export/company/excel', {
        params: { startDate, endDate },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `company_leave_report_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'Company Excel report exported successfully' };
    } catch (error) {
      console.error('Export company Excel error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to export company reports.' });
      }
      return rejectWithValue({ error: error.message || 'Failed to export company Excel report' });
    }
  }
);

// Export current user's report to CSV
export const exportCurrentUserReportToCsv = createAsyncThunk(
  'reportExport/exportCurrentUserReportToCsv',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get('/reports/export/my-leaves/csv', {
        params: { startDate, endDate },
        responseType: 'text',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_leave_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'Personal CSV report exported successfully' };
    } catch (error) {
      console.error('Export personal CSV error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue({ error: error.message || 'Failed to export personal CSV report' });
    }
  }
);

// Export current user's report to Excel
export const exportCurrentUserReportToExcel = createAsyncThunk(
  'reportExport/exportCurrentUserReportToExcel',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const api = configureAxiosInstance();
      const response = await api.get('/reports/export/my-leaves/excel', {
        params: { startDate, endDate },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_leave_report_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'Personal Excel report exported successfully' };
    } catch (error) {
      console.error('Export personal Excel error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Your session has expired. Please log in again.' });
      }
      return rejectWithValue({ error: error.message || 'Failed to export personal Excel report' });
    }
  }
);

const reportExportSlice = createSlice({
  name: 'reportExport',
  initialState: {
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    resetExportState: (state) => {
      state.error = null;
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    // Entity CSV Export
    builder
      .addCase(exportEntityReportToCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportEntityReportToCsv.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportEntityReportToCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to export CSV report';
      })
      // Entity Excel Export
      .addCase(exportEntityReportToExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportEntityReportToExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportEntityReportToExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to export Excel report';
      })
      // Company CSV Export
      .addCase(exportCompanyReportToCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportCompanyReportToCsv.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportCompanyReportToCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to export company CSV report';
      })
      // Company Excel Export
      .addCase(exportCompanyReportToExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportCompanyReportToExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportCompanyReportToExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to export company Excel report';
      })
      // Current User CSV Export
      .addCase(exportCurrentUserReportToCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportCurrentUserReportToCsv.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportCurrentUserReportToCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to export personal CSV report';
      })
      // Current User Excel Export
      .addCase(exportCurrentUserReportToExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportCurrentUserReportToExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(exportCurrentUserReportToExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to export personal Excel report';
      });
  },
});

export const { resetExportState } = reportExportSlice.actions;

export const selectReportExport = (state) => state.reportExport;

export default reportExportSlice.reducer;