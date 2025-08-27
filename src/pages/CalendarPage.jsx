import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCalendarEvents, 
  fetchHolidays,
  resetCalendarState,
  selectCalendar,
  syncOutlookCalendar  // Added import for sync function
} from '../redux/features/CalendarSlice';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import EventModal from '../components/modals/EventModal';
import TeamCalendarView from '../components/calendar/TeamCalendarView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OutlookSyncModal from '../components/modals/OutlookSyncModal';

const CalendarPage = () => {
  const dispatch = useDispatch();
  const { 
    events, 
    holidays, 
    loading, 
    eventsLoading, 
    holidaysLoading, 
    error, 
    success, 
    message,
    syncingOutlook  // Added state for sync status
  } = useSelector(selectCalendar);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day, team
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isOutlookSyncModalOpen, setIsOutlookSyncModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Calculate date range based on current date and view
  const calculateDateRange = () => {
    let start, end;
    
    switch(view) {
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
      case 'week':
        // Get start of week and end of week
        const day = currentDate.getDay();
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - day);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'day':
        start = new Date(currentDate);
        end = new Date(currentDate);
        break;
      default:
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
    }
    
    return { startDate: start, endDate: end };
  };
  
  const { startDate, endDate } = calculateDateRange();
  
  // Fetch events and holidays when date range changes
  useEffect(() => {
    // Prevent multiple simultaneous requests
    if (isFetching) return;
    
    setIsFetching(true);
    setLoadingTimeout(false);
    
    // Add loading timeout to prevent infinite spinner
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, 10000); // 10 seconds timeout
    
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCalendarEvents({ 
            startTime: startDate,
            endTime: endDate // Fixed parameter name
          })),
          dispatch(fetchHolidays({
            startDate: startDate,
            endDate: endDate
          }))
        ]);
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchData();
    
    // Clean up timeout on unmount or when dependencies change
    return () => clearTimeout(timeoutId);
  }, [dispatch, startDate.toISOString(), endDate.toISOString()]); // Only depend on the actual date values
  
  // Handle toast messages
  useEffect(() => {
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
        icon: '📅',
      });
      dispatch(resetCalendarState());
    }
    
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
      });
      dispatch(resetCalendarState());
    }
  }, [success, message, error, dispatch]);
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleViewChange = (newView) => {
    setView(newView);
  };
  
  const handleDateSelect = (date) => {
    // Create a new event at the selected date
    setSelectedEvent({
      title: '',
      description: '',
      startTime: date.toISOString(),
      endTime: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // Default 1 hour duration
      eventType: 'PERSONAL'
    });
    setIsEventModalOpen(true);
  };
  
  const handleEventSelect = (event) => {
    setSelectedEvent({
      ...event,
      startTime: typeof event.startTime === 'string' ? event.startTime : event.startTime.toISOString(),
      endTime: typeof event.endTime === 'string' ? event.endTime : event.endTime.toISOString()
    });
    setIsEventModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };
  
  // Handle opening Outlook sync modal
  const handleSyncOutlook = () => {
    console.log('Sync Outlook button clicked');
    setIsOutlookSyncModalOpen(true);
  };
  
  // Handle closing Outlook sync modal
  const handleCloseOutlookModal = () => {
    console.log('Closing Outlook sync modal');
    setIsOutlookSyncModalOpen(false);
  };
  
  // New direct sync function without modal
  const handleQuickSync = async () => {
    try {
      toast.loading('Syncing with Outlook...', { id: 'outlookSync' });
      
      await dispatch(syncOutlookCalendar()).unwrap();
      
      // Refresh events after sync
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      await dispatch(fetchCalendarEvents({
        startTime: startDate,
        endTime: endDate
      }));
      
      toast.success('Calendar synced with Outlook successfully!', {
        id: 'outlookSync',
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
    } catch (error) {
      console.error('Quick sync error:', error);
      toast.error(error?.message || 'Failed to sync with Outlook', { id: 'outlookSync' });
    }
  };
  
  const formatDateForDisplay = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else if (view === 'day') {
      return format(currentDate, 'MMMM d, yyyy');
    }
    return format(currentDate, 'MMMM yyyy');
  };
  
  // Process events for calendar display
  const processEvents = () => {
    return (events || []).map(event => ({
      ...event,
      startTime: typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime,
      endTime: typeof event.endTime === 'string' ? parseISO(event.endTime) : event.endTime
    }));
  };

  // Process holidays for calendar display
  const processHolidays = () => {
    return (holidays || []).map(holiday => ({
      ...holiday,
      date: typeof holiday.date === 'string' ? parseISO(holiday.date) : holiday.date
    }));
  };
  
  // Check for loading state with safety checks
  const isLoading = loading || eventsLoading || holidaysLoading;
  
  // Show calendar content after timeout even if loading never completes
  if (isLoading && !loadingTimeout) {
    return <LoadingSpinner />;
  }
  
  // If loading times out, show user a message but render the calendar anyway
  const showTimeoutMessage = loadingTimeout && isLoading;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {showTimeoutMessage && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Note</p>
          <p>Data is taking longer than expected to load. Showing available data.</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Calendar</h1>
            <p className="text-gray-600">
              Manage your events, leave requests, and team schedules
            </p>
          </div>
          
          {/* Added visible sync button */}
          <button
            onClick={handleQuickSync}
            disabled={syncingOutlook}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncingOutlook ? 'Syncing...' : 'Sync with Outlook'}
          </button>
        </div>
      </div>
      
      <CalendarHeader 
        title={formatDateForDisplay()}
        view={view}
        onViewChange={handleViewChange}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
        onToday={() => setCurrentDate(new Date())}
        onSyncOutlook={handleSyncOutlook} // Keep this for modal option
      />
      
      {view === 'team' ? (
        <TeamCalendarView 
          departmentId={selectedDepartmentId}
          startDate={startDate}
          endDate={endDate}
          onDepartmentChange={setSelectedDepartmentId}
        />
      ) : (
        <CalendarGrid 
          view={view}
          currentDate={currentDate}
          events={processEvents()}
          holidays={processHolidays()}
          onDateSelect={handleDateSelect}
          onEventSelect={handleEventSelect}
        />
      )}
      
      {isEventModalOpen && (
        <EventModal 
          isOpen={isEventModalOpen}
          onClose={handleCloseModal}
          event={selectedEvent}
        />
      )}
      
      <OutlookSyncModal 
        isOpen={isOutlookSyncModalOpen}
        onClose={handleCloseOutlookModal}
      />
      
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 bg-gray-800 text-white p-2 text-xs">
          Modal state: {isOutlookSyncModalOpen ? 'Open' : 'Closed'}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;