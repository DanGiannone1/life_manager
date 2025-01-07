import { useDispatch } from 'react-redux';
import { Task, Goal, Status, STATUS_DISPLAY } from '../../types';
import { updateTask } from '../../store/slices/tasksSlice';
import { updateGoal } from '../../store/slices/goalsSlice';
import { motion } from 'framer-motion';

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

  const handleStatusClick = () => {
    const newStatus = cycleStatus(item.status);
    const now = new Date().toISOString();

    if (item.type === 'task') {
      const statusHistoryEntry = {
        status: newStatus,
        changedAt: now,
      };

      dispatch(updateTask({
        id: item.id,
        changes: {
          status: newStatus,
          statusHistory: [...item.statusHistory, statusHistoryEntry],
          updatedAt: now,
        },
      }));
    } else {
      const changes: Partial<Goal> = {
        status: newStatus,
        updatedAt: now,
      };

      if (newStatus === 'complete') {
        changes.progressHistory = [
          ...(item as Goal).progressHistory,
          {
            date: now,
            value: 100,
            notes: 'Goal completed',
          },
        ];
      }

      dispatch(updateGoal({
        id: item.id,
        changes,
      }));
    }
  };

  return (
    <motion.button
      onClick={handleStatusClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        item.status === 'complete'
          ? 'bg-green-100 text-green-800'
          : item.status === 'workingOnIt'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-800'
      }`}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {item.status === 'complete' && (
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
      {STATUS_DISPLAY[item.status]}
    </motion.button>
  );
};

export default StatusCell;