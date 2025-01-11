// Common Types
export type UUID = string;
export type ISODateString = string;

export type Status = 'notStarted' | 'workingOnIt' | 'complete';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TimeRange = 'day' | 'week' | 'month';
export type ChangeType = 'text' | 'status' | 'priority' | 'drag';

export interface CompletionEntry {
    completedAt: ISODateString;
    nextDueDate?: ISODateString;
    completionNotes?: string;
}

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
    
    completionHistory: CompletionEntry[];
    
    recurrence?: {
        isRecurring: boolean;
        rule?: RecurrenceRule;
    };
    
    tags?: string[];
}

// Redux State Types
export interface TasksState {
    items: Record<UUID, Task>;
    loading: boolean;
    error: string | null;
}

export interface SyncState {
    status: 'idle' | 'syncing' | 'error';
    lastSynced: string | null;
    pendingChanges: number;
}

export interface LayoutState {
    sidebarCollapsed: boolean;
}

export interface RootState {
    tasks: TasksState;
    sync: SyncState;
    layout: LayoutState;
} 