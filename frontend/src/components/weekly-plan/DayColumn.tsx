// src/components/weekly-plan/DayColumn.tsx
import { useDispatch } from 'react-redux';
import { Task } from '@/utils/types';
import TaskCard from '../task/TaskCard';
import { updateTask } from '@/state/slices/taskSlice';
import { syncChanges } from '@/state/syncEngine';

interface DayColumnProps {
  date: Date;
  tasks: Task[];
}

const DayColumn = ({ date, tasks }: DayColumnProps) => {
  const dispatch = useDispatch();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/task-id');
    
    if (!taskId) return;

    const newScheduledDate = date.toISOString();

    // Optimistically update Redux
    dispatch(updateTask({
      id: taskId,
      changes: { scheduledDate: newScheduledDate }
    }));

    // Sync to backend
    syncChanges('drag', [{
      type: 'task',
      operation: 'update',
      id: taskId,
      data: { scheduledDate: newScheduledDate }
    }]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div
      className="flex-1 p-2 overflow-y-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isDraggable
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
              Drop tasks here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayColumn;