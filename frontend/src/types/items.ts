export type Status = 'Not Started' | 'Working On It' | 'Complete';
export type Priority = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
export type ItemType = 'task' | 'goal';

interface CompletionHistoryEntry {
  completedAt: string;
  nextDueDate: string;
}

export interface BaseItem {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  status: Status;
  priority: number;
  displayPriority: Priority;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
  subcategoryId?: string;
  isRecurring?: boolean;
  frequencyInDays?: number;
  completionHistory?: CompletionHistoryEntry[];
}

export interface TaskItem extends BaseItem {
  type: 'task';
  goalIds?: string[];
}

export interface GoalItem extends BaseItem {
  type: 'goal';
  targetDate?: string;
  taskIds?: string[];
} 