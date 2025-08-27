// components/calendar/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from '../../redux/features/CalendarSlice';
import { parseISO, format } from 'date-fns';
import { X, Trash } from 'lucide-react';

const EventModal = ({ isOpen, onClose, event }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    eventType: 'PERSONAL'
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Initialize form data from event
  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id || '',
        title: event.title || '',
        description: event.description || '',
        startTime: event.startTime ? format(parseISO(event.startTime), "yyyy-MM-dd'T'HH:mm") : '',
        endTime: event.endTime ? format(parseISO(event.endTime), "yyyy-MM-dd'T'HH:mm") : '',
        eventType: event.eventType || 'PERSONAL'
      });
    }
  }, [event]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString()
    };
    
    if (formData.id) {
      dispatch(updateCalendarEvent(payload));
    } else {
      dispatch(createCalendarEvent(payload));
    }
    
    onClose();
  };
  
  const handleDelete = () => {
    if (formData.id) {
      setIsDeleting(true);
      dispatch(deleteCalendarEvent(formData.id))
        .unwrap()
        .then(() => {
          setIsDeleting(false);
          onClose();
        })
        .catch(() => {
          setIsDeleting(false);
        });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {formData.id ? 'Edit Event' : 'Create Event'}
                  </h3>
                  <button 
                    type="button" 
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Event Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                      Event Type
                    </label>
                    <select
                      id="eventType"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="PERSONAL">Personal</option>
                      <option value="MEETING">Meeting</option>
                      <option value="TASK">Task</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    {formData.id && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {isDeleting ? 'Deleting...' : (
                          <>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </button>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {formData.id ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;