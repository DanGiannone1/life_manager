// src/components/weekly-plan/WeeklyCalendar.tsx
import { format, isSameDay } from 'date-fns';
import { Task } from '@/utils/types';
import DayColumn from './DayColumn';

interface WeeklyCalendarProps {
  weekDates: Date[];
  tasks: Task[];
}

const WeeklyCalendar = ({ weekDates, tasks }: WeeklyCalendarProps) => {
  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.scheduledDate) return false;
      return isSameDay(new Date(task.scheduledDate), date);
    });
  };

  return (
    <div className="h-full border rounded-lg bg-card">
      <div className="h-full flex divide-x">
        {weekDates.map(date => {
          const dayTasks = getTasksForDate(date);
          const isToday = isSameDay(date, new Date());
          
          return (
            <div 
              key={date.toISOString()} 
              className="flex-1 flex flex-col min-w-0"
            >
              {/* Day header */}
              <div className={`
                px-2 py-3 text-center border-b
                ${isToday ? 'bg-primary/5' : ''}
              `}>
                <div className="text-sm font-medium">
                  {format(date, 'EEEE')}
                </div>
                <div className={`
                  text-sm mt-1
                  ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}
                `}>
                  {format(date, 'MMM d')}
                </div>
              </div>

              {/* Day content */}
              <DayColumn 
                date={date} 
                tasks={dayTasks}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;