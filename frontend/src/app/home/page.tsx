"use client";


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

export default function Home() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Welcome to Life Manager</h2>
      </div>
      <p className="subtitle">Your personal productivity dashboard</p>
      <div className="content-grid md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard content will go here */}
      </div>
    </div>
  );
}
