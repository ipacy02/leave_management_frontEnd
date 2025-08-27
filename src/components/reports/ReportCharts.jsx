import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#4f46e5', '#7e22ce', '#1d4ed8', '#15803d', '#b91c1c', '#c2410c', '#0369a1', '#4338ca'];

const ReportCharts = ({ statistics }) => {
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeChart, setActiveChart] = useState('bar');
  
  useEffect(() => {
    if (statistics) {
      // Format leave type data for charts
      if (statistics.leaveTypeBreakdown) {
        setLeaveTypeData(statistics.leaveTypeBreakdown.map(item => ({
          name: item.leaveTypeName,
          days: parseFloat(item.totalDays),
          percentage: parseFloat(item.percentage)
        })));
      }
      
      // Format monthly data for charts
      if (statistics.monthlyDistribution) {
        const data = Object.entries(statistics.monthlyDistribution)
          .map(([month, days]) => ({
            name: month.charAt(0).toUpperCase() + month.slice(1),
            days: parseFloat(days)
          }))
          .filter(item => item.days > 0)
          .sort((a, b) => {
            const months = [
              'january', 'february', 'march', 'april', 'may', 'june',
              'july', 'august', 'september', 'october', 'november', 'december'
            ];
            return months.indexOf(a.name.toLowerCase()) - months.indexOf(b.name.toLowerCase());
          });
          
        setMonthlyData(data);
      }
    }
  }, [statistics]);
  
  const renderBarChart = () => (
    <div className="h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={leaveTypeData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} days`, 'Total']}
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend />
          <Bar dataKey="days" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  
  const renderPieChart = () => (
    <div className="h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={leaveTypeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="days"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {leaveTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} days`, 'Total']}
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
  
  const renderMonthlyChart = () => (
    <div className="h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={monthlyData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} days`, 'Leave Days']}
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="days" stroke="#7e22ce" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  
  // If no statistics available
  if (!statistics || (!leaveTypeData.length && !monthlyData.length)) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-64">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Visualized Report Data</h2>
      
      {/* Chart Type Selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveChart('bar')}
          className={`px-4 py-2 rounded-md transition ${
            activeChart === 'bar'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Leave Types
        </button>
        <button
          onClick={() => setActiveChart('pie')}
          className={`px-4 py-2 rounded-md transition ${
            activeChart === 'pie'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Distribution
        </button>
        <button
          onClick={() => setActiveChart('monthly')}
          className={`px-4 py-2 rounded-md transition ${
            activeChart === 'monthly'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Monthly Trend
        </button>
      </div>
      
      {/* Chart Display */}
      {activeChart === 'bar' && leaveTypeData.length > 0 && renderBarChart()}
      {activeChart === 'pie' && leaveTypeData.length > 0 && renderPieChart()}
      {activeChart === 'monthly' && monthlyData.length > 0 && renderMonthlyChart()}
      
      {/* Fallback if data is missing */}
      {activeChart === 'bar' && leaveTypeData.length === 0 && (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No leave type data available</p>
        </div>
      )}
      
      {activeChart === 'pie' && leaveTypeData.length === 0 && (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No leave type data available</p>
        </div>
      )}
      
      {activeChart === 'monthly' && monthlyData.length === 0 && (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No monthly distribution data available</p>
        </div>
      )}
      
      {/* Chart Legend/Info */}
      <div className="mt-4 text-sm text-gray-600">
        {activeChart === 'bar' && (
          <p>This chart shows the breakdown of leave days by leave type during the selected period.</p>
        )}
        {activeChart === 'pie' && (
          <p>This chart shows the percentage distribution of leave types during the selected period.</p>
        )}
        {activeChart === 'monthly' && (
          <p>This chart shows the trend of leave days taken each month during the selected period.</p>
        )}
      </div>
    </div>
  );
};

export default ReportCharts;