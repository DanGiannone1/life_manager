// Common Types
export type UUID = string;
export type ISODateString = string;

export type Status = 'notStarted' | 'workingOnIt' | 'complete';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TimeRange = 'day' | 'week' | 'month';
export type WidgetType = 'todaysTasks' | 'progress' | 'upcomingTasks';

// Time Tracking
export interface TimeTracking {
  estimatedMinutes?: number;
  actualMinutes?: number;
}

// Status History
export interface StatusHistoryEntry {
  status: Status;
  changedAt: ISODateString;
  notes?: string;
}

// Completion Entry
export interface CompletionEntry {
  completedAt: ISODateString;
  completedBy: UUID;
  nextDueDate?: ISODateString;
  completionNotes?: string;
}

// Recurrence Rule
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: ISODateString;
  maxOccurrences?: number;
  daysOfWeek?: number[];  // 0-6 for weekly
  dayOfMonth?: number;    // 1-31 for monthly
  months?: number[];      // 1-12 for yearly
  weekOfMonth?: number;   // -1 to 5 (-1 for last)
}

// Task Interface
export interface Task {
  id: UUID;
  userId: UUID;
  type: 'task';
  title: string;
  status: Status;
  priority: number;
  dynamicPriority: number;
  effort?: number;
  notes?: string;
  dueDate?: ISODateString;
  scheduledDate?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  categoryId?: UUID;
  subcategoryId?: UUID;
  
  statusHistory: StatusHistoryEntry[];
  completionHistory: CompletionEntry[];
  timeTracking?: TimeTracking;
  
  recurrence?: {
    isRecurring: boolean;
    rule?: RecurrenceRule;
  };
  
  tags?: string[];
  
  dependencies?: {
    blockedBy?: UUID[];
    blocks?: UUID[];
  };
  
  relationships?: {
    goalIds?: UUID[];
  };
}

// Goal Interface
export interface Goal {
  id: UUID;
  userId: UUID;
  type: 'goal';
  title: string;
  status: Status;
  priority: number;
  dynamicPriority: number;
  effort?: number;
  notes?: string;
  categoryId?: UUID;
  subcategoryId?: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  
  measurement?: {
    targetValue?: number;
    currentValue?: number;
    measureUnit?: string;
  };
  
  timeline: {
    startDate?: ISODateString;
    targetDate: ISODateString;
  };
  
  relationships?: {
    parentGoalId?: UUID;
    childGoalIds?: UUID[];
    taskIds?: UUID[];
  };
  
  progressHistory: {
    date: ISODateString;
    value: number;
    notes?: string;
  }[];
}

// Category Interface
export interface Category {
  id: UUID;
  userId: UUID;
  name: string;
  color?: string;
  parentId?: UUID;
  
  organization: {
    icon?: string;
    displayOrder: number;
  };
  
  subcategories: {
    id: UUID;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    displayOrder: number;
  }[];
  
  description?: string;
  
  statistics?: {
    totalItems?: number;
    completedItems?: number;
    averageCompletionTime?: number;
  };
}

// Dashboard Widget Interface
export interface DashboardWidget {
  id: UUID;
  type: WidgetType;
  position: number;
  config: {
    title?: string;
    timeRange?: TimeRange;
  };
}

// Dashboard Interface
export interface Dashboard {
  id: UUID;
  userId: UUID;
  widgets: DashboardWidget[];
}

// Display Mappings
export const STATUS_DISPLAY = {
  notStarted: 'Not Started',
  workingOnIt: 'Working on It',
  complete: 'Complete'
} as const;

export const STATUS_COLORS = {
  notStarted: 'gray.500',
  workingOnIt: 'yellow.500',
  complete: 'green.500'
} as const;

export const PRIORITY_DISPLAY = {
  ranges: [
    { min: 80, label: 'Very High', color: 'red.500' },
    { min: 60, label: 'High', color: 'orange.500' },
    { min: 40, label: 'Medium', color: 'yellow.500' },
    { min: 20, label: 'Low', color: 'green.500' },
    { min: 0, label: 'Very Low', color: 'green.250' }
  ]
} as const;

export const EFFORT_DISPLAY = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Very High'
} as const;

export const TIME_RANGE_DISPLAY = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly'
} as const; 