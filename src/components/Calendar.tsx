import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type CalendarProps = {
  taskDates: string[];
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
};

export default function Calendar({ taskDates, onDateClick, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const hasTasksOnDate = (day: number) => {
    return taskDates.some(taskDate => {
      const taskDateTime = new Date(taskDate);
      return (
        taskDateTime.getFullYear() === year &&
        taskDateTime.getMonth() === month &&
        taskDateTime.getDate() === day
      );
    });
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    onDateClick(clickedDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-400/30"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-300" />
        </button>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-400/30"
        >
          <ChevronRight className="w-5 h-5 text-cyan-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hasTasks = hasTasksOnDate(day);
          const isSelected = isSelectedDate(day);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-cyan-500 text-white border-2 border-cyan-300 shadow-lg shadow-cyan-500/50'
                  : isTodayDate
                  ? 'bg-blue-500/30 text-cyan-200 border-2 border-blue-400/50'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-600/30 hover:border-cyan-400/50 hover:bg-slate-700/50'
                }
                relative
              `}
            >
              {day}
              {hasTasks && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-400/50"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-800/50 border border-slate-600/30 relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-400"></div>
            </div>
            <span>Has Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
