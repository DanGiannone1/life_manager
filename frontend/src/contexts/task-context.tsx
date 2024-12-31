"use client";

import { createContext, useContext, useReducer, ReactNode } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface RecurringTask extends Task {
  frequency: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    custom_days?: number[];
  };
  last_completed?: string;
  next_due?: string;
  streak: number;
}

interface OneTimeTask extends Task {
  due_date: string;
  completed_at?: string;
}

type TaskState = {
  recurringTasks: RecurringTask[];
  oneTimeTasks: OneTimeTask[];
  loading: boolean;
  error: string | null;
};

type TaskAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_RECURRING_TASKS'; payload: RecurringTask[] }
  | { type: 'SET_ONE_TIME_TASKS'; payload: OneTimeTask[] }
  | { type: 'ADD_RECURRING_TASK'; payload: RecurringTask }
  | { type: 'ADD_ONE_TIME_TASK'; payload: OneTimeTask }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string };

const initialState: TaskState = {
  recurringTasks: [],
  oneTimeTasks: [],
  loading: false,
  error: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_RECURRING_TASKS':
      return { ...state, recurringTasks: action.payload, loading: false };
    case 'SET_ONE_TIME_TASKS':
      return { ...state, oneTimeTasks: action.payload, loading: false };
    case 'ADD_RECURRING_TASK':
      return {
        ...state,
        recurringTasks: [...state.recurringTasks, action.payload],
      };
    case 'ADD_ONE_TIME_TASK':
      return {
        ...state,
        oneTimeTasks: [...state.oneTimeTasks, action.payload],
      };
    case 'UPDATE_TASK':
      // Handle both recurring and one-time tasks
      return {
        ...state,
        recurringTasks: state.recurringTasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        ),
        oneTimeTasks: state.oneTimeTasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        recurringTasks: state.recurringTasks.filter(
          (task) => task.id !== action.payload
        ),
        oneTimeTasks: state.oneTimeTasks.filter(
          (task) => task.id !== action.payload
        ),
      };
    default:
      return state;
  }
}

const TaskContext = createContext<
  | {
      state: TaskState;
      dispatch: React.Dispatch<TaskAction>;
    }
  | undefined
>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 