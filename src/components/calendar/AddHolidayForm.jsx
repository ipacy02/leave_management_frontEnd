import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createHoliday, selectCalendar } from '../../redux/features/CalendarSlice';
import { format } from 'date-fns';

const AddHolidayForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(selectCalendar);
  
  const [holidayData, setHolidayData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    countryId: null // You might want to add a country selector if needed
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHolidayData({
      ...holidayData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(createHoliday(holidayData)).unwrap();
      onClose(); // Close the form on success
    } catch (err) {
      // Error is handled by the redux slice
      console.error('Failed to create holiday:', err);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Holiday</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Holiday Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={holidayData.name}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={holidayData.date}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={holidayData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
              Recurring Holiday (repeats yearly)
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Holiday'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHolidayForm;