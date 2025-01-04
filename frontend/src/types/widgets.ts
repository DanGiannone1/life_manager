import { TodayTasksWidget } from "@/components/widgets/today-tasks";
import { UpcomingTasksWidget } from "@/components/widgets/upcoming-tasks";
import { ProgressStatsWidget } from "@/components/widgets/progress-stats";

export type WidgetType = 'today-tasks' | 'upcoming-tasks' | 'progress-stats';

export interface WidgetDefinition {
  id: WidgetType;
  title: string;
  description: string;
  component: React.ComponentType;
}

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    id: 'today-tasks',
    title: "Today's Tasks",
    description: 'Shows tasks due today',
    component: TodayTasksWidget
  },
  {
    id: 'upcoming-tasks',
    title: 'Upcoming Tasks',
    description: 'Shows tasks due in the next 7 days',
    component: UpcomingTasksWidget
  },
  {
    id: 'progress-stats',
    title: 'Progress Stats',
    description: 'Shows your task completion statistics',
    component: ProgressStatsWidget
  }
]; 