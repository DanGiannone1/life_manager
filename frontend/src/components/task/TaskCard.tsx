
import { Task } from '../../utils/types';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      {/* Card content will be added later */}
    </div>
  );
};

export default TaskCard; 