'use client';

import { useState } from 'react';
import { TaskItem } from '@/types/items';
import { format } from 'date-fns';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarDayProps {
  date: Date;
  tasks: TaskItem[];
  onDrop: (task: TaskItem, sourceDate?: string) => void;
  onTaskUnschedule: (task: TaskItem) => void;
  onTaskComplete?: (task: TaskItem) => void;
}

export function CalendarDay({ 
  date, 
  tasks, 
  onDrop, 
  onTaskUnschedule,
  onTaskComplete 
}: CalendarDayProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const dateKey = format(date, 'yyyy-MM-dd');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const taskData = e.dataTransfer.getData('text/plain');
      const task = JSON.parse(taskData) as TaskItem;
      const sourceDate = e.dataTransfer.getData('source-date');
      onDrop(task, sourceDate || undefined);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleTaskComplete = (task: TaskItem) => {
    if (!onTaskComplete || completingTasks.has(task.id)) return;
    
    // Add task to completing set
    setCompletingTasks(prev => new Set(prev).add(task.id));

    // Wait for animation to complete before calling parent handler
    setTimeout(() => {
      onTaskComplete(task);
    }, 800);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-full p-2 space-y-2 transition-colors ${
        isDragOver ? 'bg-blue-50' : ''
      }`}
    >
      {tasks.length === 0 && (
        <div className="h-full flex items-start justify-center pt-8 text-gray-400 text-sm">
          Drop tasks here
        </div>
      )}
      {tasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(task));
            e.dataTransfer.setData('source-date', dateKey);
          }}
          className={cn(
            "group p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all relative cursor-move hover:border-gray-300",
            completingTasks.has(task.id) && "animate-complete"
          )}
        >
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <button
              onClick={() => handleTaskComplete(task)}
              className={cn(
                "w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 transition-colors flex items-center justify-center",
                completingTasks.has(task.id) && "bg-green-500 border-green-500"
              )}
            >
              {completingTasks.has(task.id) && (
                <Check className="h-3 w-3 text-white animate-check" />
              )}
            </button>
          </div>
          <button
            onClick={() => onTaskUnschedule(task)}
            className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-opacity"
            title="Remove from calendar"
          >
            <X className="h-3 w-3 text-gray-500" />
          </button>
          <div className="pl-7 pr-6">
            <h4 className={cn(
              "text-sm font-medium text-gray-900",
              completingTasks.has(task.id) && "line-through text-gray-500"
            )}>
              {task.title}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className={`priority-badge ${task.displayPriority.toLowerCase().replace(' ', '-')}`}>
                {task.displayPriority}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 