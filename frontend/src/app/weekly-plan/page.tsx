'use client';

import { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, endOfWeek } from 'date-fns';
import { TaskList } from '@/components/weekly-plan/task-list';
import { CalendarDay } from '@/components/weekly-plan/calendar-day';
import { TaskItem } from '@/types/items';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';

export default function WeeklyPlanPage() {
  const { items, loading, error, updateItem } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyTasks, setWeeklyTasks] = useState<{ [key: string]: TaskItem[] }>({});

  // Get unscheduled tasks (Not Started or Working On It)
  const unscheduledTasks = items
    .filter((item): item is TaskItem => 
      item.type === 'task' && 
      (item.status === 'Not Started' || item.status === 'Working On It')
    );

  // Get the start and end of the week
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);

  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const handleTaskDrop = (date: Date, task: TaskItem, sourceDate?: string) => {
    const targetDateKey = format(date, 'yyyy-MM-dd');

    // If dropping in the same day, do nothing
    if (sourceDate && sourceDate === targetDateKey) {
      return;
    }

    // Remove task from source (either task list or another day)
    if (sourceDate) {
      // Moving from one day to another
      setWeeklyTasks(prev => {
        const newTasks = { ...prev };
        newTasks[sourceDate] = prev[sourceDate]?.filter(t => t.id !== task.id) || [];
        newTasks[targetDateKey] = [...(prev[targetDateKey] || []), task];
        return newTasks;
      });
    } else {
      // Moving from task list to calendar
      setWeeklyTasks(prev => ({
        ...prev,
        [targetDateKey]: [...(prev[targetDateKey] || []), task],
      }));
    }
  };

  const handleTaskUnschedule = (task: TaskItem, sourceDate: string) => {
    // Remove from calendar
    setWeeklyTasks(prev => ({
      ...prev,
      [sourceDate]: prev[sourceDate]?.filter(t => t.id !== task.id) || [],
    }));
  };

  const handleTaskComplete = async (task: TaskItem, dateKey: string) => {
    try {
      // Update UI immediately after animation completes
      setTimeout(() => {
        setWeeklyTasks(prev => ({
          ...prev,
          [dateKey]: prev[dateKey]?.filter(t => t.id !== task.id) || [],
        }));
      }, 800); // Match the animation duration

      // Update backend and global state
      await updateItem({
        ...task,
        status: 'Complete'
      });
    } catch (error) {
      console.error('Error completing task:', error);
      // Could add error handling/rollback here if needed
    }
  };

  // Format the date range for the header
  const dateRangeText = `${format(weekStart, 'LLL d')} - ${format(weekEnd, 'LLL d, yyyy')}`;

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
      {/* Task List Section - Fixed width, full height */}
      <div className="w-[280px] border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Tasks</h2>
          <TaskList 
            tasks={unscheduledTasks}
            loading={loading}
            error={error}
            onTaskReturn={handleTaskUnschedule}
          />
        </div>
      </div>

      {/* Calendar Section - Flexible width, full height */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold flex items-baseline">
            Weekly Plan
            <span className="text-base text-gray-500 ml-2 font-normal">
              {dateRangeText}
            </span>
          </h1>
          <div className="flex gap-4">
            <Button onClick={handlePreviousWeek} variant="outline" size="sm">
              Previous Week
            </Button>
            <Button onClick={handleNextWeek} variant="outline" size="sm">
              Next Week
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid-container h-full">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDates.map((date) => (
                <div
                  key={date.toISOString()}
                  className="p-4 text-center border-r last:border-r-0"
                >
                  <div className="font-medium text-gray-900">{format(date, 'EEE')}</div>
                  <div className="text-sm text-gray-500">{format(date, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 h-[calc(100%-57px)]">
              {weekDates.map((date) => {
                const dateKey = format(date, 'yyyy-MM-dd');
                return (
                  <div
                    key={date.toISOString()}
                    className="border-r last:border-r-0 h-full"
                  >
                    <CalendarDay
                      date={date}
                      tasks={weeklyTasks[dateKey] || []}
                      onDrop={(task, sourceDate) => handleTaskDrop(date, task, sourceDate)}
                      onTaskUnschedule={(task) => handleTaskUnschedule(task, dateKey)}
                      onTaskComplete={(task) => handleTaskComplete(task, dateKey)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 