import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function ProgressStatsWidget() {
  const { items } = useApp();
  
  const taskStats = items
    .filter(item => item.type === 'task')
    .reduce((acc, task) => {
      switch (task.status) {
        case 'Complete':
          acc.completed++;
          break;
        case 'Working On It':
          acc.inProgress++;
          break;
        case 'Not Started':
          acc.notStarted++;
          break;
      }
      return acc;
    }, { completed: 0, inProgress: 0, notStarted: 0 });

  const total = taskStats.completed + taskStats.inProgress + taskStats.notStarted;
  const completionRate = total > 0 ? Math.round((taskStats.completed / total) * 100) : 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Progress</h3>
        <span className="text-sm font-medium text-[#00DE94]">{completionRate}% complete</span>
      </div>
      <div className="space-y-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00DE94] transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Completed"
            value={taskStats.completed}
            icon={CheckCircle2}
            color="text-[#00DE94]"
          />
          <StatCard
            label="In Progress"
            value={taskStats.inProgress}
            icon={Clock}
            color="text-[#F5B800]"
          />
          <StatCard
            label="Not Started"
            value={taskStats.notStarted}
            icon={XCircle}
            color="text-gray-400"
          />
        </div>
      </div>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
} 