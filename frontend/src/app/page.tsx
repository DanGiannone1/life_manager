"use client";

import { TaskCard } from '@/components/tasks/task-card';

// This would normally come from an API
const mockTasks = [
  {
    id: '1',
    title: 'Complete Project Report',
    description: 'Write and submit the quarterly project report',
    priority: 'high',
    status: 'in_progress',
    category: 'Work',
    dueDate: '2024-01-05',
    isRecurring: false,
  },
  {
    id: '2',
    title: 'Morning Exercise',
    description: '30 minutes of cardio',
    priority: 'medium',
    status: 'pending',
    category: 'Health',
    isRecurring: true,
    streak: 5,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Add Task
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <h2 className="font-semibold">Today's Tasks</h2>
          {mockTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description}
              priority={task.priority as 'low' | 'medium' | 'high'}
              status={task.status as 'pending' | 'in_progress' | 'completed'}
              category={task.category}
              dueDate={task.dueDate}
              isRecurring={task.isRecurring}
              streak={task.streak}
              onComplete={() => console.log('Complete task:', task.id)}
            />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Upcoming</h2>
          {/* Add upcoming tasks here */}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Recent Activity</h2>
          {/* Add activity feed here */}
        </div>
      </div>
    </div>
  );
}
