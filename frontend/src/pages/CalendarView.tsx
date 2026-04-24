import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

const DAYS = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön']
const MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
]

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Sample events
  const events: Record<number, { title: string; color: string }[]> = {
    5: [{ title: 'Fakturering', color: '#1976D2' }],
    12: [{ title: 'Påminnelse', color: '#EF4444' }],
    15: [{ title: 'Moms', color: '#F59E0B' }],
    20: [{ title: 'Lön', color: '#10B981' }],
    25: [{ title: 'Fakturering', color: '#1976D2' }],
  }

  const days = []
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = events[day] || []
    const isToday =
      new Date().getDate() === day &&
      new Date().getMonth() === month &&
      new Date().getFullYear() === year

    days.push(
      <div
        key={day}
        className={`h-24 border border-gray-200 p-2 ${isToday ? 'bg-blue-50' : 'bg-white'}`}
      >
        <span className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
          {day}
        </span>
        <div className="mt-1 space-y-1">
          {dayEvents.map((event, idx) => (
            <div
              key={idx}
              className="text-xs px-1.5 py-0.5 rounded text-white truncate"
              style={{ backgroundColor: event.color }}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
          <p className="text-sm text-gray-500">Översikt över kommande händelser</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">{days}</div>
      </div>

      {/* Upcoming events list */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" style={{ color: '#1976D2' }} />
          <span>Kommande händelser</span>
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1976D2' }} />
              <span className="text-sm text-gray-700">Fakturering - månatlig</span>
            </div>
            <span className="text-sm text-gray-500">Den 5:e varje månad</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-sm text-gray-700">Påminnelse - förfallna fakturor</span>
            </div>
            <span className="text-sm text-gray-500">Den 12:e varje månad</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-sm text-gray-700">Momsredovisning</span>
            </div>
            <span className="text-sm text-gray-500">Den 15:e varje månad</span>
          </div>
        </div>
      </div>
    </div>
  )
}
