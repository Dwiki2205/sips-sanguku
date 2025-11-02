'use client';

import { useState } from 'react';

interface BookingCalendarProps {
  onDateSelect: (date: string) => void;
  unavailableDates?: string[];
}

export default function BookingCalendar({ onDateSelect, unavailableDates = [] }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();

  const daysInMonth = lastDay.getDate();
  const days: (number | null)[] = [];

  // Previous month days
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isUnavailable = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return unavailableDates.includes(dateStr);
  };

  const isPast = (day: number) => {
    const date = new Date(year, month, day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleDateClick = (day: number | null) => {
    if (!day || isPast(day) || isUnavailable(day)) return;
    
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateStr);
    onDateSelect(dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            disabled={!day || isPast(day) || isUnavailable(day)}
            className={`
              h-10 rounded-md text-sm font-medium transition-colors
              ${!day ? 'invisible' : ''}
              ${isPast(day || 0) ? 'text-gray-300 cursor-not-allowed' : ''}
              ${isUnavailable(day || 0) ? 'bg-red-100 text-red-700 cursor-not-allowed' : ''}
              ${isSelected(day) ? 'bg-indigo-600 text-white' : ''}
              ${day && !isPast(day) && !isUnavailable(day) && !isSelected(day)
                ? 'text-gray-900 hover:bg-indigo-100 hover:text-indigo-700' 
                : ''}
            `}
            type="button"
          >
            {day}
          </button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-indigo-600 rounded"></div>
          <span>Terpilih</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span>Tidak Tersedia</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Tersedia</span>
        </div>
      </div>
    </div>
  );
}