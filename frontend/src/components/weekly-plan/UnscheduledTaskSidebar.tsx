// src/components/weekly-plan/UnscheduledTasksSidebar.tsx
import { Task } from '@/utils/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import TaskCard from '../task/TaskCard';

interface UnscheduledTasksSidebarProps {
  tasks: Task[];
}

const UnscheduledTasksSidebar = ({ tasks }: UnscheduledTasksSidebarProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-base font-medium">Unscheduled Tasks</CardTitle>
      </CardHeader>
      <CardContent className="p-2 overflow-y-auto">
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isDraggable
            />
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center p-4">
              No unscheduled tasks
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnscheduledTasksSidebar;