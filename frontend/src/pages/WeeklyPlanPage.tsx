// src/pages/WeeklyPlanPage.tsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/syncEngine';
import { startOfWeek, addDays, format, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnscheduledTasksSidebar from '@/components/weekly-plan/UnscheduledTaskSidebar';
import WeeklyCalendar from '@/components/weekly-plan/WeeklyCalendar';

const WeeklyPlanPage = () => {
  // State for the selected week's start date
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 }) // Start on Sunday
  );

  // Get all tasks from Redux
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const tasksArray = Object.values(tasks);

  // Get unscheduled tasks (no scheduledDate)
  const unscheduledTasks = tasksArray.filter(task => !task.scheduledDate);

  // Navigation handlers
  const handlePreviousWeek = () => {
    setSelectedWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeekStart(prev => addWeeks(prev, 1));
  };

  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    addDays(selectedWeekStart, i)
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with navigation */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weekly Plan</h1>
        <div className="flex items-center space-x-4">
          <div className="text-lg font-medium">
            {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Unscheduled tasks sidebar */}
        <div className="w-80 flex-shrink-0">
          <UnscheduledTasksSidebar tasks={unscheduledTasks} />
        </div>

        {/* Weekly calendar grid */}
        <div className="flex-1">
          <WeeklyCalendar 
            weekDates={weekDates}
            tasks={tasksArray}
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanPage;