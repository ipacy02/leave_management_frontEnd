import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncOutlookCalendar, selectCalendar, fetchCalendarEvents } from '../../redux/features/CalendarSlice';
import { toast } from 'react-hot-toast';

const OutlookSyncModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { syncingOutlook, error } = useSelector(selectCalendar);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset success state when modal is closed/opened
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      console.log('Modal opened');
    }
  }, [isOpen]);

  // Display error toast if there's an error
  useEffect(() => {
    if (error && isOpen) {
      toast.error(error);
    }
  }, [error, isOpen]);

  const handleSync = async () => {
    console.log('Starting Outlook sync');
    
    // Show loading toast
    toast.loading('Syncing with Outlook...', { id: 'modalOutlookSync' });
    
    try {
      await dispatch(syncOutlookCalendar()).unwrap();
      console.log('Sync completed successfully');
      setShowSuccess(true);
      
      // Refresh events after sync
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      await dispatch(fetchCalendarEvents({
        startTime: startDate,
        endTime: endDate
      }));
      
      // Success toast with custom styling
      toast.success('Calendar synced with Outlook successfully!', {
        id: 'modalOutlookSync',
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '🔄',
      });
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(error?.message || 'Failed to sync with Outlook', { id: 'modalOutlookSync' });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Sync with Outlook Calendar
            </h3>
            <div className="mt-2">
              {showSuccess ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Sync completed successfully!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  This will synchronize your events with Microsoft Outlook. Events from Outlook will be imported, and any events created here will be pushed to Outlook.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-6 flex justify-end">
          {!showSuccess && (
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSync}
              disabled={syncingOutlook}
            >
              {syncingOutlook ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </span>
              ) : 'Sync Now'}
            </button>
          )}
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={onClose}
          >
            {showSuccess ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutlookSyncModal;