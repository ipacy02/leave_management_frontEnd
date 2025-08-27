import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDepartmentStatistics,
  fetchLeaveTypeStatistics,
  fetchCompanyStatistics,
  fetchReportData,
  exportReportToCsv,
  exportReportToExcel,
  selectReports,
  resetReportState,
} from '../redux/features/ReportsSlice';
import { toast } from 'react-toastify';
import { DatePicker, Select, Button, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { DownloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportDashboard = () => {
  const dispatch = useDispatch();
  const { statistics, reportData, loading, exportLoading, error, message } = useSelector(selectReports);
  const [reportType, setReportType] = useState('COMPANY');
  const [entityId, setEntityId] = useState(null);
  const [dateRange, setDateRange] = useState([moment().startOf('year'), moment()]);
  const [departmentOptions] = useState([
    { id: 'dept1', name: 'Engineering' },
    { id: 'dept2', name: 'HR' },
    // Add more departments as needed
  ]);
  const [leaveTypeOptions] = useState([
    { id: 'leave1', name: 'Vacation' },
    { id: 'leave2', name: 'Sick Leave' },
    // Add more leave types as needed
  ]);

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
      dispatch(resetReportState());
    }

    if (message) {
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
      dispatch(resetReportState());
    }
  }, [error, message, dispatch]);

  const handleFetchStatistics = () => {
    const params = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    };

    switch (reportType) {
      case 'DEPARTMENT':
        if (entityId) {
          dispatch(fetchDepartmentStatistics({ departmentId: entityId, ...params }));
        }
        break;
      case 'LEAVE_TYPE':
        if (entityId) {
          dispatch(fetchLeaveTypeStatistics({ leaveTypeId: entityId, ...params }));
        }
        break;
      case 'COMPANY':
        dispatch(fetchCompanyStatistics(params));
        break;
      default:
        break;
    }

    dispatch(fetchReportData({ reportType, entityId, ...params }));
  };

  useEffect(() => {
    if (reportType === 'COMPANY' || entityId) {
      handleFetchStatistics();
    }
  }, [reportType, entityId, dateRange]);

  const handleExport = (format) => {
    const params = {
      reportType,
      entityId,
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    };

    if (format === 'csv') {
      dispatch(exportReportToCsv(params));
    } else {
      dispatch(exportReportToExcel(params));
    }
  };

  const prepareChartData = () => {
    if (!statistics?.monthlyDistribution) return [];
    return Object.entries(statistics.monthlyDistribution).map(([month, days]) => ({
      name: month.slice(0, 3),
      days: Number(days),
    }));
  };

  const tableColumns = [
    { title: 'Employee Name', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Email', dataIndex: 'employeeEmail', key: 'employeeEmail' },
    { title: 'Department', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'Leave Type', dataIndex: 'leaveTypeName', key: 'leaveTypeName' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'Comments', dataIndex: 'comments', key: 'comments' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Leave Statistics Dashboard</h2>

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
          >
            <Option value="COMPANY">Company</Option>
            <Option value="DEPARTMENT">Department</Option>
            <Option value="LEAVE_TYPE">Leave Type</Option>
          </Select>
        </div>

        {reportType !== 'COMPANY' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {reportType === 'DEPARTMENT' ? 'Department' : 'Leave Type'}
            </label>
            <Select
              value={entityId}
              onChange={setEntityId}
              className="w-full"
              placeholder={`Select ${reportType === 'DEPARTMENT' ? 'department' : 'leave type'}`}
            >
              {(reportType === 'DEPARTMENT' ? departmentOptions : leaveTypeOptions).map((option) => (
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
            disabled={loading || exportLoading}
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleExport('csv')}
          loading={exportLoading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
        >
          Export to CSV
        </Button>
        {/* <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleExport('excel')}
          loading={exportLoading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
        >
          Export to Excel
        </Button> */}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loading && statistics && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Total Leave Days</h3>
              <p className="text-2xl">{statistics.totalLeaveDays}</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Approved Requests</h3>
              <p className="text-2xl">{statistics.approvedRequests}</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Avg. Leave Duration</h3>
              <p className="text-2xl">{statistics.averageLeaveDuration} days</p>
            </div>
          </div>

          {/* Monthly Distribution Chart */}
          <div className="h-80">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Leave Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="days" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leave Type Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Leave Type Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statistics.leaveTypeBreakdown?.map((type) => (
                <div key={type.leaveTypeName} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{type.leaveTypeName}</span>
                    <span className="text-indigo-600">{type.percentage}%</span>
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
                        style={{ width: `${type.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{type.totalDays} days</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Report Data */}
          {reportData && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Detailed Report</h3>
              <Table
                columns={tableColumns}
                dataSource={reportData}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;