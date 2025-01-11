// src/components/task/TaskTableRow.tsx
import { useState } from 'react';
import { TableCell, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Eye, Trash2, Check } from 'lucide-react';
import TaskDetails from './TaskDetails';
import { Task } from '../../utils/types';
import {
  STATUS_DISPLAY,
  STATUS_COLORS,
  getPriorityDisplay,
  EFFORT_DISPLAY,
  getRecurrenceDisplay,
} from '../../utils/displayMappings';
import { syncChanges, store } from '../../state/syncEngine';
import { updateTask, deleteTask } from '../../state/slices/taskSlice';

// Import the CSS that controls our checkmark animation
import '../animations/StatusCheckAnimation.css';

interface TaskTableRowProps {
  task: Task;
}

const STATUS_SEQUENCE = ['notStarted', 'workingOnIt', 'complete'] as const;
const PRIORITY_SEQUENCE = [0, 20, 40, 60, 80];
const EFFORT_SEQUENCE = [1, 2, 3, 4, 5];

const TaskTableRow = ({ task }: TaskTableRowProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);

  // Format date safely
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  // Priority, Effort, Recurrence strings
  const priorityInfo = getPriorityDisplay(task.priority);
  const effortInfo = task.effort ? EFFORT_DISPLAY[task.effort] : null;
  const recurrenceLabel = getRecurrenceDisplay(
    task.recurrence?.isRecurring || false,
    task.recurrence?.rule?.frequency,
    task.recurrence?.rule?.interval
  );

  // Cycle status on click
  const handleStatusClick = () => {
    const currentIndex = STATUS_SEQUENCE.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % STATUS_SEQUENCE.length;
    const nextStatus = STATUS_SEQUENCE[nextIndex];

    // Update in Redux (optimistic UI)
    store.dispatch(
      updateTask({
        id: task.id,
        changes: { status: nextStatus },
      })
    );

    // Debounced sync to server
    syncChanges('status', [
      {
        type: 'task',
        operation: 'update',
        id: task.id,
        data: { status: nextStatus },
      },
    ]);

    // Trigger the check “pop” if newly “complete”
    if (nextStatus === 'complete') {
      setAnimateCheck(true);
      setTimeout(() => setAnimateCheck(false), 1000);
    } else {
      setAnimateCheck(false);
    }
  };

  // Cycle priority on click
  const handlePriorityClick = () => {
    const currentIndex = PRIORITY_SEQUENCE.indexOf(task.priority);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + 1) % PRIORITY_SEQUENCE.length;
    const nextPriority = PRIORITY_SEQUENCE[nextIndex];

    store.dispatch(
      updateTask({
        id: task.id,
        changes: { priority: nextPriority },
      })
    );

    syncChanges('priority', [
      {
        type: 'task',
        operation: 'update',
        id: task.id,
        data: { priority: nextPriority },
      },
    ]);
  };

  // Cycle effort on click
  const handleEffortClick = () => {
    const currentEffort = task.effort || 1;
    const currentIndex = EFFORT_SEQUENCE.indexOf(currentEffort);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + 1) % EFFORT_SEQUENCE.length;
    const nextEffort = EFFORT_SEQUENCE[nextIndex];

    store.dispatch(
      updateTask({
        id: task.id,
        changes: { effort: nextEffort },
      })
    );

    // re-using 'priority' as the "changeType" here, or define a new one if you prefer
    syncChanges('priority', [
      {
        type: 'task',
        operation: 'update',
        id: task.id,
        data: { effort: nextEffort },
      },
    ]);
  };

  // Delete this task
  const handleDeleteTask = (id: string) => {
    store.dispatch(deleteTask(id));
    syncChanges('status', [
      {
        type: 'task',
        operation: 'delete',
        id,
      },
    ]);
  };

  return (
    <>
      <TableRow
        className="
          hover:bg-muted/10 
          even:bg-muted/5 
          transition-colors
        "
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
              'status-bubble', // from StatusCheckAnimation.css
              STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800',
              animateCheck ? 'animate-check' : '',
            ].join(' ')}
          >
            {STATUS_DISPLAY[task.status] || task.status}
            <Check className="status-check-icon h-4 w-4" />
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
          {formatDate(task.dueDate)}
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
            <Button variant="default" size="sm" onClick={() => setShowDetails(true)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleDeleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
