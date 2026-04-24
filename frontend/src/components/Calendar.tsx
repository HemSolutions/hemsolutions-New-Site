import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Wrench } from 'lucide-react';
import type { Booking } from '../types';

export type CalendarView = 'month' | 'week' | 'day';

interface CalendarProps {
  bookings: Booking[];
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateClick: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
  onBookingDrop: (bookingId: number, newDate: Date) => void;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-emerald-500',
  pending: 'bg-amber-500',
  cancelled: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Bekräftad',
  pending: 'Väntande',
  cancelled: 'Avbokad',
};

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOfWeek = new Date(firstDay);
  startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());
  const endOfWeek = new Date(lastDay);
  endOfWeek.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }
  return days;
}

function getHours(): number[] {
  const hours: number[] = [];
  for (let i = 6; i <= 22; i++) hours.push(i);
  return hours;
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseBookingDate(dateStr: string): Date {
  return new Date(dateStr.replace(' ', 'T'));
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const WEEKDAY_NAMES = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
const MONTH_NAMES = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];

export default function Calendar({ bookings, view, onViewChange, onDateClick, onBookingClick, onBookingDrop }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  const navigatePrev = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() - 1);
      else if (view === 'week') d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return d;
    });
  }, [view]);

  const navigateNext = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + 1);
      else if (view === 'week') d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return d;
    });
  }, [view]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(booking => {
      const start = parseBookingDate(booking.start_time);
      const key = formatDateKey(start);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(booking);
    });
    return map;
  }, [bookings]);

  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedBooking) {
      onBookingDrop(draggedBooking.id, date);
      setDraggedBooking(null);
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const today = new Date();
    
    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-t-lg overflow-hidden">
          {WEEKDAY_NAMES.map(name => (
            <div key={name} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-600">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 flex-1 overflow-auto border-x border-b border-gray-200 rounded-b-lg">
          {days.map((day, idx) => {
            const key = formatDateKey(day);
            const dayBookings = bookingsByDate.get(key) || [];
            const isToday = isSameDay(day, today);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={idx}
                className={`bg-white min-h-[100px] p-1 cursor-pointer hover:bg-gray-50 transition-colors ${!isCurrentMonth ? 'bg-gray-50/50' : ''}`}
                onClick={() => onDateClick(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 4).map(booking => {
                    const start = parseBookingDate(booking.start_time);
                    const hour = String(start.getHours()).padStart(2, '0');
                    const min = String(start.getMinutes()).padStart(2, '0');
                    return (
                      <div
                        key={booking.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, booking)}
                        onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                        className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate cursor-move hover:opacity-80 transition-opacity`}
                        style={{ backgroundColor: booking.worker_color || '#3B82F6' }}
                        title={`${hour}:${min} - ${booking.customer_name || 'Okänd kund'} (${booking.worker_name || 'Okänd arbetare'})`}
                      >
                        {hour}:{min} {booking.customer_name || 'Okänd kund'}
                      </div>
                    );
                  })}
                  {dayBookings.length > 4 && (
                    <div className="text-[10px] text-gray-500 px-1">+{dayBookings.length - 4} till</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hours = getHours();
    const today = new Date();
    
    return (
      <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-gray-50 py-2"></div>
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={idx} className={`bg-gray-50 py-2 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="text-xs text-gray-500">{WEEKDAY_NAMES[day.getDay()]}</div>
                <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>{day.getDate()}</div>
              </div>
            );
          })}
        </div>
        {/* Body */}
        <div className="flex-1 overflow-auto">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-px bg-gray-200 min-h-[60px]">
              <div className="bg-white py-1 px-2 text-xs text-gray-500 text-right">{String(hour).padStart(2, '0')}:00</div>
              {weekDays.map((day, dayIdx) => {
                const key = formatDateKey(day);
                const dayBookings = (bookingsByDate.get(key) || []).filter(b => {
                  const start = parseBookingDate(b.start_time);
                  return start.getHours() === hour;
                });
                return (
                  <div
                    key={dayIdx}
                    className="bg-white p-1 relative hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      const clickedDate = new Date(day);
                      clickedDate.setHours(hour, 0, 0, 0);
                      onDateClick(clickedDate);
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      const droppedDate = new Date(day);
                      droppedDate.setHours(hour, 0, 0, 0);
                      handleDrop(e, droppedDate);
                    }}
                  >
                    {dayBookings.map(booking => (
                      <div
                        key={booking.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, booking)}
                        onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                        className="text-[10px] px-1.5 py-0.5 rounded text-white truncate cursor-move hover:opacity-80 mb-0.5"
                        style={{ backgroundColor: booking.worker_color || '#3B82F6' }}
                      >
                        {booking.customer_name || 'Okänd kund'}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = getHours();
    const dayKey = formatDateKey(currentDate);
    const dayBookings = bookingsByDate.get(dayKey) || [];
    const today = new Date();
    const isToday = isSameDay(currentDate, today);
    
    return (
      <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden">
        <div className={`py-3 text-center border-b ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <div className="text-lg font-semibold">{WEEKDAY_NAMES[currentDate.getDay()]} {currentDate.getDate()} {MONTH_NAMES[currentDate.getMonth()]}</div>
        </div>
        <div className="flex-1 overflow-auto">
          {hours.map(hour => {
            const hourBookings = dayBookings.filter(b => {
              const start = parseBookingDate(b.start_time);
              return start.getHours() === hour;
            });
            return (
              <div key={hour} className="flex border-b border-gray-100 min-h-[70px]">
                <div className="w-16 py-2 px-2 text-xs text-gray-500 text-right border-r border-gray-100">{String(hour).padStart(2, '0')}:00</div>
                <div
                  className="flex-1 p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    const clickedDate = new Date(currentDate);
                    clickedDate.setHours(hour, 0, 0, 0);
                    onDateClick(clickedDate);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    const droppedDate = new Date(currentDate);
                    droppedDate.setHours(hour, 0, 0, 0);
                    handleDrop(e, droppedDate);
                  }}
                >
                  <div className="space-y-1">
                    {hourBookings.map(booking => {
                      const start = parseBookingDate(booking.start_time);
                      const hour = String(start.getHours()).padStart(2, '0');
                      const min = String(start.getMinutes()).padStart(2, '0');
                      return (
                        <div
                          key={booking.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, booking)}
                          onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                          className="text-sm px-3 py-2 rounded text-white cursor-move hover:opacity-80 flex items-center gap-2"
                          style={{ backgroundColor: booking.worker_color || '#3B82F6' }}
                        >
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{hour}:{min}</span>
                          <span className="mx-1">-</span>
                          <span>{booking.customer_name || 'Okänd kund'}</span>
                          <span className="ml-auto text-xs opacity-80">({STATUS_LABELS[booking.status] || booking.status})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Idag
          </button>
          <button onClick={navigateNext} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold ml-3">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {(['month', 'week', 'day'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {v === 'month' ? 'Månad' : v === 'week' ? 'Vecka' : 'Dag'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 min-h-0">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span>Bekräftad</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span>Väntande</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Avbokad</span>
        </div>
        <div className="ml-auto text-gray-400">Dra en bokning för att schemalägga om</div>
      </div>
    </div>
  );
}
