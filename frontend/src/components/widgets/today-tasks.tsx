import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

export function TodayTasksWidget() {
  const { items } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todaysTasks = items.filter(item => 
    item.type === 'task' && 
    item.dueDate === today &&
    item.status !== 'Complete'
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Today's Tasks</h3>
        <span className="text-sm text-gray-500">{todaysTasks.length} tasks</span>
      </div>
      <div className="space-y-3">
        {todaysTasks.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks due today</p>
        ) : (
          todaysTasks.map(task => (
            <div key={task.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.displayPriority)}`} />
              <span className="text-sm flex-1">{task.title}</span>
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
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