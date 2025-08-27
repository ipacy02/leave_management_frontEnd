import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  exportEntityReportToCsv,
  exportEntityReportToExcel,
  exportCompanyReportToCsv,
  exportCompanyReportToExcel,
  exportCurrentUserReportToCsv,
  exportCurrentUserReportToExcel,
  selectReportExport,
  resetExportState,
} from '../../redux/features/AdminReporting';
import { toast } from 'react-toastify';
import { DatePicker, Select, Button, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

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

const ExportReports = () => {
  const dispatch = useDispatch();
  const { loading, error, success, message } = useSelector(selectReportExport);
  const [reportType, setReportType] = useState('MY_LEAVES');
  const [entityId, setEntityId] = useState(null);
  const [dateRange, setDateRange] = useState([moment().startOf('year'), moment()]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Fetch entity options (departments, leave types, employees)
  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const api = configureAxiosInstance();
        const [deptResponse, leaveTypeResponse, employeeResponse] = await Promise.all([
          api.get('/departments'),
          api.get('/leave-types'),
          api.get('/employees'),
        ]);
        setDepartmentOptions(deptResponse.data);
        setLeaveTypeOptions(leaveTypeResponse.data);
        setEmployeeOptions(employeeResponse.data);
      } catch (error) {
        toast.error('Failed to fetch entity options', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: 'linear-gradient(to right, #dc2626, #b91c1c)',
            color: '#fff',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        });
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // Handle toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #dc2626, #b91c1c)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      });
      dispatch(resetExportState());
    }

    if (success && message) {
      toast.success(message, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '✅',
      });
      dispatch(resetExportState());
    }
  }, [error, success, message, dispatch]);

  // Handle export button clicks
  const handleExport = (format) => {
    const params = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    };

    switch (reportType) {
      case 'MY_LEAVES':
        if (format === 'csv') {
          dispatch(exportCurrentUserReportToCsv(params));
        } else {
          dispatch(exportCurrentUserReportToExcel(params));
        }
        break;
      case 'COMPANY':
        if (format === 'csv') {
          dispatch(exportCompanyReportToCsv(params));
        } else {
          dispatch(exportCompanyReportToExcel(params));
        }
        break;
      case 'EMPLOYEE':
      case 'DEPARTMENT':
      case 'LEAVE_TYPE':
        if (entityId) {
          if (format === 'csv') {
            dispatch(exportEntityReportToCsv({ reportType, entityId, ...params }));
          } else {
            dispatch(exportEntityReportToExcel({ reportType, entityId, ...params }));
          }
        } else {
          toast.error(`Please select a${reportType === 'EMPLOYEE' ? 'n employee' : reportType === 'DEPARTMENT' ? ' department' : ' leave type'}`, {
            duration: 4000,
            position: 'top-center',
            style: {
              background: 'linear-gradient(to right, #dc2626, #b91c1c)',
              color: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          });
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Export Leave Reports</h2>

      {optionsLoading ? (
        <div className="flex justify-center items-center h-32">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <Select
                value={reportType}
                onChange={(value) => {
                  setReportType(value);
                  setEntityId(null);
                }}
                className="w-full"
                disabled={loading}
              >
                <Option value="MY_LEAVES">My Leaves</Option>
                <Option value="EMPLOYEE">Employee</Option>
                <Option value="DEPARTMENT">Department</Option>
                <Option value="LEAVE_TYPE">Leave Type</Option>
                <Option value="COMPANY">Company</Option>
              </Select>
            </div>

            {['EMPLOYEE', 'DEPARTMENT', 'LEAVE_TYPE'].includes(reportType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reportType === 'EMPLOYEE'
                    ? 'Employee'
                    : reportType === 'DEPARTMENT'
                    ? 'Department'
                    : 'Leave Type'}
                </label>
                <Select
                  value={entityId}
                  onChange={setEntityId}
                  className="w-full"
                  placeholder={`Select ${
                    reportType === 'EMPLOYEE'
                      ? 'employee'
                      : reportType === 'DEPARTMENT'
                      ? 'department'
                      : 'leave type'
                  }`}
                  disabled={loading}
                >
                  {(reportType === 'DEPARTMENT'
                    ? departmentOptions
                    : reportType === 'LEAVE_TYPE'
                    ? leaveTypeOptions
                    : employeeOptions
                  ).map((option) => (
                    <Option key={option.id} value={option.id}>
                      {option.name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                className="w-full"
                disabled={loading}
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport('csv')}
              loading={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
            >
              Export to CSV
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport('excel')}
              loading={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
            >
              Export to Excel
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportReports;