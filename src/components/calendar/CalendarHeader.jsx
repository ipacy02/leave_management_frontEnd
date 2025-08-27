import React from 'react';
import { Calendar, Users, List, RefreshCw } from 'lucide-react';

const CalendarHeader = ({ title, view, onViewChange, onPrev, onNext, onToday }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
      <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
        <h1 className="text-xl font-bold text-gray-800 truncate">{title}</h1>
        <button 
          onClick={onToday}
          className="ml-4 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Today
        </button>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange('month')}
            className={`p-1.5 rounded-md flex items-center ${view === 'month' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
            title="Month view"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`p-1.5 rounded-md flex items-center ${view === 'week' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
            title="Week view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('team')}
            className={`p-1.5 rounded-md flex items-center ${view === 'team' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
            title="Team view"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex">
          <button
            onClick={onPrev}
            className="p-1.5 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
            title="Previous"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="p-1.5 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
            title="Next"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={() => {}}
          className="p-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          title="Sync with Outlook"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;