import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { Calendar } from "lucide-react";

export function UpcomingTasksWidget() {
  const { items } = useApp();
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const upcomingTasks = items
    .filter(item => 
      item.type === 'task' && 
      item.status !== 'Complete' &&
      item.dueDate &&
      isAfter(new Date(item.dueDate), today) &&
      isBefore(new Date(item.dueDate), nextWeek)
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
        <span className="text-sm text-gray-500">{upcomingTasks.length} tasks</span>
      </div>
      <div className="space-y-3">
        {upcomingTasks.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming tasks this week</p>
        ) : (
          upcomingTasks.map(task => (
            <div key={task.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.displayPriority)}`} />
              <span className="text-sm flex-1">{task.title}</span>
              <span className="text-xs text-gray-500">
                {format(new Date(task.dueDate!), 'MMM d')}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Very High':
      return 'bg-[#E84B3C]';
    case 'High':
      return 'bg-[#F5B800]';
    case 'Medium':
      return 'bg-[#808080]';
    case 'Low':
      return 'bg-[#00DE94]';
    case 'Very Low':
      return 'bg-[#B0B0B0]';
    default:
      return 'bg-gray-400';
  }
} 