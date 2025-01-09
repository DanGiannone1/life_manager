import { useDispatch, useSelector } from 'react-redux';
import { Task, Goal, Status, STATUS_DISPLAY } from '../../types';
import { updateTask } from '../../store/slices/tasksSlice';
import { updateGoal } from '../../store/slices/goalsSlice';
import { motion } from 'framer-motion';
import { RootState } from '@/store';
import { useSync } from '@/hooks/useSync';

interface StatusCellProps {
  item: Task | Goal;
}

const cycleStatus = (currentStatus: Status): Status => {
  switch (currentStatus) {
    case 'notStarted':
      return 'workingOnIt';
    case 'workingOnIt':
      return 'complete';
    case 'complete':
      return 'notStarted';
  }
};

export const StatusCell = ({ item }: StatusCellProps) => {
  const dispatch = useDispatch();
  const { handleChange, syncStatus } = useSync();
  
  // Remove hyphens from ID when accessing Redux state
  const normalizedId = item.id
  
  // Subscribe to the specific item's status in Redux
  const currentStatus = useSelector((state: RootState) => {
    const taskStatus = item.type === 'task' ? state.tasks.items[normalizedId]?.status : null;
    const goalStatus = item.type === 'goal' ? state.goals.items[normalizedId]?.status : null;
    
    console.log('Redux state for this item:', {
      itemId: item.id,
      normalizedId,
      itemType: item.type,
      taskStatus,
      goalStatus,
      fullItem: item.type === 'task' ? state.tasks.items[normalizedId] : state.goals.items[normalizedId],
      allTasks: state.tasks.items // Debug: see all tasks in store
    });
    
    return item.type === 'task' 
      ? taskStatus
      : goalStatus;
  }) || item.status;

  console.log('Using status:', currentStatus, 'from', item.type === 'task' ? 'Redux' : 'props');

  const handleStatusClick = () => {
    const newStatus = cycleStatus(currentStatus);
    const now = new Date().toISOString();
    console.log('New status will be:', newStatus);

    if (item.type === 'task') {
      const changes = {
        status: newStatus,
        statusHistory: [
          ...item.statusHistory,
          { status: newStatus, changedAt: now }
        ],
        updatedAt: now,
      };

      console.log('Dispatching task update with:', changes);
      // Update Redux immediately
      dispatch(updateTask({
        id: normalizedId,
        changes,
      }));

      // Trigger debounced sync
      handleChange(
        'task',
        'update',
        changes,
        'status',
        normalizedId
      );
    } else {
      const changes = {
        status: newStatus,
        updatedAt: now,
        ...(newStatus === 'complete' && {
          progressHistory: [
            ...(item as Goal).progressHistory,
            {
              date: now,
              value: 100,
              notes: 'Goal completed',
            },
          ],
        }),
      };

      console.log('Dispatching goal update with:', changes);
      // Update Redux immediately
      dispatch(updateGoal({
        id: normalizedId,
        changes,
      }));

      // Trigger debounced sync
      handleChange(
        'goal',
        'update',
        changes,
        'status',
        normalizedId
      );
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'workingOnIt':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <motion.button
      onClick={handleStatusClick}
      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${getStatusColor(currentStatus)}`}
      whileTap={{ scale: 0.95 }}
      layout
      disabled={syncStatus === 'error'} // Disable the button if there's a sync error
    >
      {currentStatus === 'complete' && (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-3 h-3 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </motion.svg>
      )}
      {STATUS_DISPLAY[currentStatus]}
    </motion.button>
  );
};

export default StatusCell;