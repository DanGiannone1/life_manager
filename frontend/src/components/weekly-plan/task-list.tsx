'use client';

import { useState } from 'react';
import { TaskItem } from '@/types/items';

interface TaskListProps {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  onTaskReturn?: (task: TaskItem, sourceDate: string) => void;
}

export function TaskList({ tasks, loading, error, onTaskReturn }: TaskListProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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
      const sourceDate = e.dataTransfer.getData('source-date');
      if (sourceDate && onTaskReturn) {
        const task = JSON.parse(taskData) as TaskItem;
        onTaskReturn(task, sourceDate);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`space-y-2 min-h-[200px] transition-colors rounded-lg ${
        isDragOver ? 'bg-blue-50' : ''
      }`}
    >
      {tasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(task));
          }}
          className="p-3 bg-white rounded-lg border border-gray-200 cursor-move hover:border-gray-300 transition-colors"
        >
          <h3 className="font-medium text-sm">{task.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={`priority-badge ${task.displayPriority.toLowerCase().replace(' ', '-')}`}>
              {task.displayPriority}
            </span>
            <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
              {task.status}
            </span>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {isDragOver ? 'Drop to unschedule task' : 'No tasks available'}
        </div>
      )}
    </div>
  );
} 