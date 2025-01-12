//src/components/task/Recurrence.ts

import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { RecurrenceRule, CompletionEntry } from '@/utils/types';

/**
 * Calculate the next due date based on a recurrence rule
 */
export function calculateNextDueDate(
  currentDueDate: string | undefined,
  rule: RecurrenceRule
): string {
  // Use current due date or today as base
  const baseDate = currentDueDate ? new Date(currentDueDate) : new Date();
  
  // Calculate next date based on frequency and interval
  let nextDate: Date;
  switch (rule.frequency) {
    case 'daily':
      nextDate = addDays(baseDate, rule.interval);
      break;
    case 'weekly':
      nextDate = addWeeks(baseDate, rule.interval);
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, rule.interval);
      break;
    case 'yearly':
      nextDate = addYears(baseDate, rule.interval);
      break;
    default:
      throw new Error(`Unknown frequency: ${rule.frequency}`);
  }

  // Handle day constraints for weekly frequency
  if (rule.frequency === 'weekly' && rule.daysOfWeek?.length) {
    // Find the next allowed day of week
    while (!rule.daysOfWeek.includes(nextDate.getDay())) {
      nextDate = addDays(nextDate, 1);
    }
  }

  // Handle month/day constraints for monthly frequency
  if (rule.frequency === 'monthly' && rule.dayOfMonth) {
    // Set to specified day of month, handling end of month cases
    const maxDays = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(rule.dayOfMonth, maxDays);
    nextDate.setDate(targetDay);
  }

  return nextDate.toISOString();
}

/**
 * Create a completion record for a task
 */
export function createCompletionRecord(
  nextDueDate?: string,
  notes?: string
): CompletionEntry {
  return {
    completedAt: new Date().toISOString(),
    nextDueDate,
    completionNotes: notes
  };
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'PPP');
}

/**
 * Check if a task should be reset based on its recurrence rule
 */
export function shouldResetTask(
  task: { recurrence?: { isRecurring: boolean; rule?: RecurrenceRule } }
): boolean {
  return Boolean(
    task.recurrence?.isRecurring && 
    task.recurrence.rule &&
    task.recurrence.rule.frequency
  );
}