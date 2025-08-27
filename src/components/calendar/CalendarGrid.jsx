import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  isSameDay,
  addDays,
  format
} from 'date-fns';

const CalendarGrid = ({ view, currentDate, events, holidays, onDateSelect, onEventSelect }) => {
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    // Add day headers
    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(dayName => (
      <div key={dayName} className="p-1 text-center font-medium text-gray-500 text-xs md:text-sm">
        {dayName}
      </div>
    ));
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isToday(day);
        
        // Find events for this day
        const dayEvents = events.filter(event =>
          isSameDay(new Date(event.startTime), day)
        );
        
        // Find holidays for this day
        const dayHolidays = holidays.filter(holiday =>
          isSameDay(new Date(holiday.date), day)
        );
        
        days.push(
          <div
            key={day.toString()}
            className={`min-h-24 h-24 border border-gray-200 p-1 relative ${
              !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
            } ${isCurrentDay ? 'bg-blue-50' : ''}`}
            onClick={() => onDateSelect(new Date(day))}
          >
            <div className="flex justify-between items-start">
              <span className={`inline-block h-5 w-5 text-xs md:text-sm rounded-full text-center leading-5 ${
                isCurrentDay ? 'bg-blue-500 text-white' : ''
              }`}>
                {formattedDate}
              </span>
            </div>
            
            {/* Holidays */}
            {dayHolidays.length > 0 && (
              <div className="mt-1">
                {dayHolidays.slice(0, 1).map(holiday => (
                  <div
                    key={holiday.id}
                    className="p-0.5 text-xs bg-red-100 text-red-800 rounded truncate"
                    title={holiday.name}
                  >
                    {holiday.name}
                  </div>
                ))}
                {dayHolidays.length > 1 && (
                  <div className="text-xs text-red-600">+{dayHolidays.length - 1} more</div>
                )}
              </div>
            )}
            
            {/* Events */}
            <div className="mt-1 space-y-0.5 max-h-12 overflow-hidden">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className="p-0.5 text-xs bg-indigo-100 text-indigo-800 rounded truncate cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventSelect(event);
                  }}
                  title={`${format(new Date(event.startTime), 'HH:mm')} - ${event.title}`}
                >
                  {format(new Date(event.startTime), 'HH:mm')} - {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-indigo-600">+{dayEvents.length - 2} more</div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return (
      <div>
        <div className="grid grid-cols-7">
          {dayHeaders}
        </div>
        {rows}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 gap-2 overflow-hidden">
      {renderMonthView()}
    </div>
  );
};

export default CalendarGrid;