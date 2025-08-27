const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const formattedDate = format(day, 'EEE, MMM d');
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
          className={`border border-gray-200 ${isCurrentDay ? 'bg-blue-50' : ''}`}
        >
          <div className="p-2 border-b border-gray-200 font-medium">
            {formattedDate}
          </div>
          
          <div className="p-2 min-h-64 space-y-2">
            {/* Holidays */}
            {dayHolidays.map(holiday => (
              <div 
                key={holiday.id} 
                className="p-2 bg-red-100 text-red-800 rounded mb-2"
              >
                {holiday.name}
              </div>
            ))}
            
            {/* Events */}
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="p-2 bg-indigo-100 text-indigo-800 rounded mb-2 cursor-pointer"
                onClick={() => onEventSelect(event)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-sm">
                  {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                </div>
              </div>
            ))}
            
            <div 
                className="p-2 border border-dashed border-gray-300 rounded text-gray-500 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => onDateSelect(day)}
              >
                + Add event
              </div>
            </div>
          </div>
      );
    

  
  return (
    <div className="bg-white rounded-lg shadow">
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
    </div>
  );
}}

export default renderWeekView;