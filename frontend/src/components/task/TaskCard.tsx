// src/components/weekly-plan/TaskCard.tsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Task } from '@/utils/types';
import { Card } from '@/components/ui/card';
import { Check, GripVertical } from 'lucide-react';
import { STATUS_DISPLAY, STATUS_COLORS } from '@/utils/displayMappings';
import { updateTask } from '@/state/slices/taskSlice';
import { syncChanges } from '@/state/syncEngine';
import { 
  calculateNextDueDate,
  createCompletionRecord,
  shouldResetTask,
} from '@/components/task/Recurrence';
import '@/components/animations/animations.css';

interface TaskCardProps {
  task: Task;
  isDraggable?: boolean;
}

const STATUS_SEQUENCE = ['notStarted', 'workingOnIt', 'complete'] as const;

const TaskCard = ({ task, isDraggable }: TaskCardProps) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Handle marking a recurring task as complete
  const handleRecurringComplete = () => {
    if (!task.recurrence?.rule) return;

    // Calculate next due date and create completion record
    const nextDueDate = calculateNextDueDate(task.recurrence.rule);
    const completionRecord = createCompletionRecord(nextDueDate);
    const changes: Partial<Task> = {
      status: 'notStarted' as const,
      dueDate: nextDueDate,
      scheduledDate: nextDueDate,
      completionHistory: [...(task.completionHistory || []), completionRecord]
    };

    // Show completion state briefly
    dispatch(updateTask({
      id: task.id,
      changes: { status: 'complete' }
    }));

    // Start animations
    setAnimateCheck(true);

    // After checkmark and flash animations, start fade out
    setTimeout(() => {
      setIsFadingOut(true);
      
      // After fade out completes, update the task
      setTimeout(() => {
        dispatch(updateTask({
          id: task.id,
          changes
        }));

        syncChanges('status', [{
          type: 'task',
          operation: 'update',
          id: task.id,
          data: changes
        }]);

        // Reset animations
        setAnimateCheck(false);
        setIsFadingOut(false);
      }, 500); // Match the fade-out duration
    }, 1000); // Wait for checkmark and flash animations
  };

  // Handle status changes
  const handleStatusClick = () => {
    let nextStatus: typeof STATUS_SEQUENCE[number];

    switch (task.status) {
      case 'notStarted':
        nextStatus = 'workingOnIt';
        setAnimateCheck(false);
        break;
      case 'workingOnIt':
        nextStatus = 'complete';
        // If it's a recurring task, handle differently
        if (shouldResetTask(task)) {
          handleRecurringComplete();
          return;
        }
        // Otherwise, just show checkmark for non-recurring task
        setAnimateCheck(true);
        break;
      case 'complete':
        nextStatus = 'notStarted';
        setAnimateCheck(false);
        break;
      default:
        nextStatus = 'notStarted';
        setAnimateCheck(false);
    }

    // For non-recurring tasks being completed, add completion record
    if (nextStatus === 'complete') {
      const completionRecord = createCompletionRecord();
      const changes: Partial<Task> = {
        status: nextStatus,
        completionHistory: [...(task.completionHistory || []), completionRecord]
      };

      dispatch(updateTask({
        id: task.id,
        changes
      }));

      syncChanges('status', [{
        type: 'task',
        operation: 'update',
        id: task.id,
        data: changes
      }]);
      return;
    }

    // For all other status changes
    const changes: Partial<Task> = { status: nextStatus };
    
    dispatch(updateTask({
      id: task.id,
      changes
    }));

    syncChanges('status', [{
      type: 'task',
      operation: 'update',
      id: task.id,
      data: changes
    }]);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/task-id', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={[
        'relative flex flex-col p-3 gap-2',
        isDraggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'opacity-50' : '',
        task.status === 'complete' ? 'animate-completion' : '',
        isFadingOut ? 'fade-out' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Header with drag handle and title */}
      <div className="flex items-center gap-2">
        {isDraggable && (
          <div className="flex-shrink-0 text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {task.title}
          </div>
        </div>
      </div>

      {/* Status Bubble */}
      <button
        onClick={handleStatusClick}
        className={[
          'inline-flex items-center justify-center w-28 h-7 px-2 rounded-full text-xs relative',
          'status-bubble',
          STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800',
          animateCheck || task.status === 'complete' ? 'animate-check' : '',
          task.status === 'complete' ? 'status-complete' : '',
        ].join(' ')}
      >
        <div className="flex items-center gap-1">
          {task.status === 'complete' && (
            <Check className="status-check-icon h-4 w-4" />
          )}
          {STATUS_DISPLAY[task.status] || task.status}
        </div>
      </button>
    </Card>
  );
};

export default TaskCard;