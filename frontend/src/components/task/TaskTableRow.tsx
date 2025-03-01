// src/components/task/TaskTableRow.tsx
import { useState } from 'react';
import { TableCell, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Eye, Trash2, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TaskDetails from './TaskDetails';
import { Task } from '@/utils/types';
import {
  STATUS_DISPLAY,
  STATUS_COLORS,
  getPriorityDisplay,
  EFFORT_DISPLAY,
  getRecurrenceDisplay,
} from '@/utils/displayMappings';
import { syncChanges, store } from '@/state/syncEngine';
import { updateTask, deleteTask } from '@/state/slices/taskSlice';
import { calculateNextDueDate, createCompletionRecord, shouldResetTask, formatDate } from './Recurrence';
import '@/components/animations/animations.css';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const STATUS_SEQUENCE = ['notStarted', 'workingOnIt', 'complete'] as const;
const PRIORITY_SEQUENCE = [0, 20, 40, 60, 80];
const EFFORT_SEQUENCE = [1, 2, 3, 4, 5];

interface TaskTableRowProps {
  task: Task;
}

const TaskTableRow = ({ task }: TaskTableRowProps) => {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Priority, Effort, Recurrence strings
  const priorityInfo = getPriorityDisplay(task.priority);
  const effortInfo = task.effort ? EFFORT_DISPLAY[task.effort] : null;
  const recurrenceLabel = getRecurrenceDisplay(
    task.recurrence?.isRecurring || false,
    task.recurrence?.rule?.frequency,
    task.recurrence?.rule?.interval
  );

  // Handle marking a recurring task as complete
  const handleRecurringComplete = () => {
    if (!task.recurrence?.rule) return;

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(task.recurrence.rule);
    
    // Create completion record
    const completionRecord = createCompletionRecord(nextDueDate);

    // Show completion state briefly
    store.dispatch(updateTask({
      id: task.id,
      changes: { status: 'complete' }
    }));

    // Trigger animations
    setAnimateCheck(true);
    setTimeout(() => {
      setIsResetting(true);

      // Update task with new status, due date, and completion history
      store.dispatch(updateTask({
        id: task.id,
        changes: {
          status: 'notStarted',
          dueDate: nextDueDate,
          completionHistory: [...task.completionHistory, completionRecord]
        }
      }));

      // Sync changes to backend
      syncChanges('status', [{
        type: 'task',
        operation: 'update',
        id: task.id,
        data: {
          status: 'notStarted',
          dueDate: nextDueDate,
          completionHistory: [...task.completionHistory, completionRecord]
        }
      }]);

      // Show toast notification
      toast({
        title: "Task Reset",
        description: `${task.title} will be due again on ${formatDate(nextDueDate)}`,
      });

      // Reset animations
      setAnimateCheck(false);
      setTimeout(() => setIsResetting(false), 300);
    }, 1500);
  };

  // Handle status changes
  const handleStatusClick = () => {
    const currentIndex = STATUS_SEQUENCE.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % STATUS_SEQUENCE.length;
    const nextStatus = STATUS_SEQUENCE[nextIndex];

    // If completing a recurring task
    if (nextStatus === 'complete' && shouldResetTask(task)) {
      handleRecurringComplete();
      return;
    }

    // Handle normal status change
    store.dispatch(updateTask({
      id: task.id,
      changes: { status: nextStatus }
    }));

    syncChanges('status', [{
      type: 'task',
      operation: 'update',
      id: task.id,
      data: { status: nextStatus }
    }]);

    // Update animation state based on status
    if (nextStatus === 'complete') {
      setAnimateCheck(true);
    } else {
      setAnimateCheck(false);
    }
  };

  // Handle priority changes
  const handlePriorityClick = () => {
    const currentIndex = PRIORITY_SEQUENCE.indexOf(task.priority);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + 1) % PRIORITY_SEQUENCE.length;
    const nextPriority = PRIORITY_SEQUENCE[nextIndex];

    store.dispatch(updateTask({
      id: task.id,
      changes: { priority: nextPriority }
    }));

    syncChanges('priority', [{
      type: 'task',
      operation: 'update',
      id: task.id,
      data: { priority: nextPriority }
    }]);
  };

  // Handle effort changes
  const handleEffortClick = () => {
    const currentEffort = task.effort || 1;
    const currentIndex = EFFORT_SEQUENCE.indexOf(currentEffort);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + 1) % EFFORT_SEQUENCE.length;
    const nextEffort = EFFORT_SEQUENCE[nextIndex];

    store.dispatch(updateTask({
      id: task.id,
      changes: { effort: nextEffort }
    }));

    syncChanges('priority', [{
      type: 'task',
      operation: 'update',
      id: task.id,
      data: { effort: nextEffort }
    }]);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    store.dispatch(deleteTask(id));
    syncChanges('status', [{
      type: 'task',
      operation: 'delete',
      id
    }]);
  };

  return (
    <>
      <TableRow
        className={[
          'task-row hover:bg-muted/10 even:bg-muted/5 transition-colors',
          isResetting ? 'task-resetting' : '',
          task.status === 'complete' ? 'animate-completion' : '',
        ].filter(Boolean).join(' ')}
      >
        {/* TITLE */}
        <TableCell className="px-4 py-2">
          {task.title}
        </TableCell>

        {/* STATUS BUBBLE */}
        <TableCell className="px-4 py-2">
          <button
            onClick={handleStatusClick}
            className={[
              'inline-flex items-center justify-center w-28 h-8 px-2 py-1 rounded-full text-xs relative',
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
        </TableCell>

        {/* PRIORITY CHIP */}
        <TableCell className="px-4 py-2">
          <button
            onClick={handlePriorityClick}
            className={[
              'inline-flex items-center justify-center w-24 h-8 px-2 py-1 rounded-full text-xs font-medium',
              priorityInfo.colorClass,
              'cursor-pointer transition-transform hover:scale-105'
            ].join(' ')}
          >
            {priorityInfo.label}
          </button>
        </TableCell>

        {/* EFFORT CHIP */}
        <TableCell className="px-4 py-2">
          <button
            onClick={handleEffortClick}
            className={[
              'inline-flex items-center justify-center w-20 h-8 px-2 py-1 rounded-full text-xs font-medium',
              effortInfo ? effortInfo.colorClass : 'bg-gray-100 text-gray-800',
              'cursor-pointer transition-transform hover:scale-105'
            ].join(' ')}
          >
            {effortInfo ? effortInfo.label : 'N/A'}
          </button>
        </TableCell>

        {/* DUE DATE */}
        <TableCell className="px-4 py-2">
          {task.dueDate ? formatDate(task.dueDate) : '-'}
        </TableCell>

        {/* RECURRENCE */}
        <TableCell className="px-4 py-2">
          {recurrenceLabel}
        </TableCell>

        {/* NOTES */}
        <TableCell className="px-4 py-2 whitespace-nowrap max-w-xs overflow-hidden overflow-ellipsis">
          {task.notes?.trim() || '-'}
        </TableCell>

        {/* ACTIONS */}
        <TableCell className="px-4 py-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Popover open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Delete this task?</p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDeleteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        handleDeleteTask(task.id);
                        setIsDeleteOpen(false);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TableCell>
      </TableRow>

      {/* DETAILS DIALOG */}
      {showDetails && (
        <TaskDetails
          task={task}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}
    </>
  );
};

export default TaskTableRow;