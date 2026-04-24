import * as React from "react"
import { cn } from "@/lib/utils"

export type CalendarProps = {
  mode?: "single" | "multiple" | "range"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  initialFocus?: boolean
}

function Calendar({ mode = "single", selected, onSelect, disabled, className, initialFocus }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(selected)

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const weekDays = ["Sö", "Må", "Ti", "On", "To", "Fr", "Lö"]
  const months = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
  ]

  const handleSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (disabled?.(date)) return
    setSelectedDate(date)
    onSelect?.(date)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return disabled?.(date) || false
  }

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={prevMonth} className="p-1 hover:bg-accent rounded-md">
          ←
        </button>
        <div className="font-semibold">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button type="button" onClick={nextMonth} className="p-1 hover:bg-accent rounded-md">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {weekDays.map((day) => (
          <div key={day} className="text-muted-foreground font-medium text-xs py-1">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="py-1">
            {day !== null ? (
              <button
                type="button"
                onClick={() => handleSelect(day)}
                disabled={isDisabled(day)}
                className={cn(
                  "w-8 h-8 rounded-md text-sm flex items-center justify-center mx-auto",
                  isSelected(day) && "bg-primary text-primary-foreground",
                  isToday(day) && !isSelected(day) && "border border-primary",
                  isDisabled(day) && "opacity-50 cursor-not-allowed",
                  !isSelected(day) && !isDisabled(day) && "hover:bg-accent"
                )}
              >
                {day}
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
