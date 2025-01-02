'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, endOfWeek } from 'date-fns';
import { TaskList } from '@/components/weekly-plan/task-list';
import { CalendarDay } from '@/components/weekly-plan/calendar-day';
import { TaskItem } from '@/types/items';
import { Button } from '@/components/ui/button';

export default function WeeklyPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [unscheduledTasks, setUnscheduledTasks] = useState<TaskItem[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<{ [key: string]: TaskItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the start and end of the week
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);

  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch initial unscheduled tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError(null);
        const response = await fetch('http://localhost:5000/api/get-master-list?type=task&statuses=Not Started,Working On It');
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to fetch tasks');
        }
        const data = await response.json();
        setUnscheduledTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
      setUnscheduledTasks(prev => prev.filter(t => t.id !== task.id));
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
    // Add back to task list
    setUnscheduledTasks(prev => [...prev, task]);
  };

  const handleTaskComplete = async (task: TaskItem, dateKey: string) => {
    // Update UI immediately after animation completes
    setTimeout(() => {
      setWeeklyTasks(prev => ({
        ...prev,
        [dateKey]: prev[dateKey]?.filter(t => t.id !== task.id) || [],
      }));
    }, 800); // Match the animation duration

    // Update backend asynchronously
    try {
      const response = await fetch(`http://localhost:5000/api/batch-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: [{
            id: task.id,
            status: 'Complete'
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
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