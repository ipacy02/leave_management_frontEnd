import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamCalendar, selectCalendar } from '../../redux/features/CalendarSlice';
import { fetchAllDepartments, selectDepartments } from '../../redux/features/departmentsSlice';
import { format, parseISO } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import AddHolidayForm from './AddHolidayForm';

const TeamCalendarView = ({ departmentId, startDate, endDate, onDepartmentChange }) => {
  const dispatch = useDispatch();
  const { teamCalendar, teamCalendarLoading } = useSelector(selectCalendar);
  const { departments, loading: departmentsLoading } = useSelector(selectDepartments);
  const [isFetching, setIsFetching] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showAddHolidayForm, setShowAddHolidayForm] = useState(false);
  
  // Fetch departments when component mounts
  useEffect(() => {
    dispatch(fetchAllDepartments());
  }, [dispatch]);
  
  // Set default department if none selected
  useEffect(() => {
    if (!departmentId && departments.length > 0) {
      onDepartmentChange(departments[0].id);
    }
  }, [departmentId, departments, onDepartmentChange]);
  
  // Fetch team calendar data when department changes
  useEffect(() => {
    if (isFetching) return;
    
    if (departmentId) {
      setIsFetching(true);
      setLoadingTimeout(false);
      
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
      
      const fetchData = async () => {
        try {
          await dispatch(fetchTeamCalendar({
            departmentId,
            startDate,
            endDate
          }));
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchData();
      
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, departmentId, startDate.toISOString(), endDate.toISOString()]);
  
  const handleDepartmentChange = (e) => {
    onDepartmentChange(e.target.value);
  };
  
  const toggleAddHolidayForm = () => {
    setShowAddHolidayForm(!showAddHolidayForm);
  };
  
  const handleAddHolidayClose = () => {
    setShowAddHolidayForm(false);
    // Refresh the team calendar data to show the new holiday
    if (departmentId) {
      dispatch(fetchTeamCalendar({
        departmentId,
        startDate,
        endDate
      }));
    }
  };
  
  if ((departmentsLoading || teamCalendarLoading) && !loadingTimeout) {
    return <LoadingSpinner />;
  }
  
  const showTimeoutMessage = loadingTimeout && teamCalendarLoading;
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {showTimeoutMessage && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Note</p>
          <p>Data is taking longer than expected to load. Showing available data.</p>
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <select
          id="department"
          value={departmentId || ''}
          onChange={handleDepartmentChange}
          className="block w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Team Leaves</h3>
          {teamCalendar.teamLeaves && teamCalendar.teamLeaves.length > 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-md">
              <ul className="divide-y divide-gray-200">
                {teamCalendar.teamLeaves.map(leave => (
                  <li key={leave.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-indigo-600">{leave.leaveTypeName}</p>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(leave.startDate), 'MMM d, yyyy')} - {format(parseISO(leave.endDate), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Employee: {leave.userName || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Email: {leave.email || 'N/A'}
                        </p>
                        {leave.reason && (
                          <p className="text-sm text-gray-500 mt-1">
                            Reason: {leave.reason}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {leave.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {leave.fullDay ? 'Full Day' : 'Partial Day'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {leave.leaveDuration} {leave.leaveDuration === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No team leaves scheduled.</p>
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Holidays</h3>
            <button
              onClick={toggleAddHolidayForm}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Holiday
            </button>
          </div>
          
          {showAddHolidayForm && (
            <div className="mb-6">
              <AddHolidayForm onClose={handleAddHolidayClose} />
            </div>
          )}
          
          {teamCalendar.holidays && teamCalendar.holidays.length > 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-md">
              <ul className="divide-y divide-gray-200">
                {teamCalendar.holidays.map(holiday => (
                  <li key={holiday.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-red-600">{holiday.name}</p>
                        {holiday.isRecurring && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            Recurring
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(holiday.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No upcoming holidays.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendarView;