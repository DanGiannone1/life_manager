// src/components/task/Recurrence.ts

import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';
import { RecurrenceRule, CompletionEntry } from '@/utils/types';

/**
 * Calculate the next due date based on a recurrence rule
 * Now using the current date as the base for calculations
 */
export function calculateNextDueDate(
  rule: RecurrenceRule
): string {
  // Always use current date as the base for next occurrence
  const now = new Date();
  const baseDate = new Date(now);
  
  // Calculate next date based on frequency and interval
  let nextDate: Date;
  switch (rule.frequency) {
    case 'daily':
      nextDate = addDays(baseDate, rule.interval);
      break;
      
    case 'weekly':
      // First, add the weeks
      nextDate = addWeeks(baseDate, rule.interval);
      
      // If specific days of week are specified
      if (rule.daysOfWeek?.length) {
        // Find the next allowed day of week after our calculated date
        const currentDay = nextDate.getDay();
        let daysUntilNext = 7; // Maximum days we might need to add
        
        for (const allowedDay of rule.daysOfWeek) {
          const diff = allowedDay - currentDay;
          const adjustedDiff = diff <= 0 ? diff + 7 : diff;
          if (adjustedDiff < daysUntilNext) {
            daysUntilNext = adjustedDiff;
          }
        }
        
        nextDate = addDays(nextDate, daysUntilNext);
      }
      break;
      
    case 'monthly':
      nextDate = addMonths(baseDate, rule.interval);
      
      // If a specific day of month is specified
      if (rule.dayOfMonth) {
        // Get the last day of the target month
        const lastDay = new Date(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          0
        ).getDate();
        
        // Use the specified day, but don't exceed the last day of the month
        const targetDay = Math.min(rule.dayOfMonth, lastDay);
        nextDate.setDate(targetDay);
        
        // If the calculated date is before current date, move to next month
        if (isBefore(nextDate, now)) {
          nextDate = addMonths(nextDate, 1);
        }
      }
      break;
      
    case 'yearly':
      nextDate = addYears(baseDate, rule.interval);
      break;
      
    default:
      throw new Error(`Unknown frequency: ${rule.frequency}`);
  }
  
  // Ensure we never return a date in the past
  if (isBefore(nextDate, now)) {
    switch (rule.frequency) {
      case 'daily':
        nextDate = addDays(now, rule.interval);
        break;
      case 'weekly':
        nextDate = addWeeks(now, rule.interval);
        break;
      case 'monthly':
        nextDate = addMonths(now, rule.interval);
        break;
      case 'yearly':
        nextDate = addYears(now, rule.interval);
        break;
    }
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
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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