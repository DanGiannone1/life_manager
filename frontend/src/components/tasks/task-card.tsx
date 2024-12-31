"use client";

import { CheckCircle2, Clock, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  category?: string;
  dueDate?: string;
  isRecurring?: boolean;
  streak?: number;
  onComplete?: () => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

export function TaskCard({
  title,
  description,
  priority,
  status,
  category,
  dueDate,
  isRecurring,
  streak,
  onComplete,
}: TaskCardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <button
          onClick={onComplete}
          className="rounded-full p-1 hover:bg-gray-100"
          disabled={status === 'completed'}
        >
          <CheckCircle2 
            className={cn(
              'h-6 w-6',
              status === 'completed' ? 'text-green-500' : 'text-gray-400'
            )} 
          />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={cn(
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
          priorityColors[priority]
        )}>
          {priority}
        </span>
        
        <span className={cn(
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
          statusColors[status]
        )}>
          {status}
        </span>

        {category && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            <Tag className="h-3 w-3" />
            {category}
          </span>
        )}

        {dueDate && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            <Clock className="h-3 w-3" />
            {dueDate}
          </span>
        )}

        {isRecurring && streak !== undefined && streak > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600">
            🔥 {streak}
          </span>
        )}
      </div>
    </div>
  );
} 