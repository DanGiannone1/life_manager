// File: src/utils/displayMappings.ts

/**
 * STATUS_DISPLAY - The user-facing text for each status
 */
export const STATUS_DISPLAY: Record<string, string> = {
    notStarted: 'Not Started',
    workingOnIt: 'Working on It',
    complete: 'Complete',
  };
  
  /**
   * STATUS_COLORS - Pastel backgrounds + darker text
   */
  export const STATUS_COLORS: Record<string, string> = {
    notStarted: 'bg-gray-100 text-gray-800',
    workingOnIt: 'bg-orange-100 text-orange-800',
    complete: 'bg-green-100 text-green-800',
  };
  
  /**
   * getPriorityDisplay - Return { label, colorClass } for each priority numeric range.
   * Example ranges:
   *   80+ -> Very High (bg-red-100 text-red-800)
   *   60+ -> High      (bg-pink-100 text-pink-800)
   *   40+ -> Medium    (bg-yellow-100 text-yellow-800)
   *   20+ -> Low       (bg-green-100 text-green-800)
   *   <20 -> Very Low  (bg-teal-100 text-teal-800)
   */
  export function getPriorityDisplay(priority: number) {
    if (priority >= 80) {
      return { label: 'Very High', colorClass: 'bg-red-100 text-red-800' };
    } else if (priority >= 60) {
      return { label: 'High', colorClass: 'bg-pink-100 text-pink-800' };
    } else if (priority >= 40) {
      return { label: 'Medium', colorClass: 'bg-yellow-100 text-yellow-800' };
    } else if (priority >= 20) {
      return { label: 'Low', colorClass: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Very Low', colorClass: 'bg-teal-100 text-teal-800' };
    }
  }
  
  /**
   * EFFORT_DISPLAY - Pastel scale from 1..5
   */
  export const EFFORT_DISPLAY: Record<number, { label: string; colorClass: string }> = {
    1: { label: 'Very Low',  colorClass: 'bg-purple-50  text-purple-600' },
    2: { label: 'Low',       colorClass: 'bg-purple-100 text-purple-700' },
    3: { label: 'Medium',    colorClass: 'bg-purple-200 text-purple-800' },
    4: { label: 'High',      colorClass: 'bg-purple-300 text-purple-900' },
    5: { label: 'Very High', colorClass: 'bg-purple-400 text-white'      },
  };
  
  /**
   * getRecurrenceDisplay - Example function to produce user-friendly text
   * (No color classes here—just returns a string.)
   */
  export function getRecurrenceDisplay(
    isRecurring: boolean,
    frequency?: string,
    interval?: number
  ): string {
    if (!isRecurring) return 'None';
    if (!frequency) return 'Recurring (?)';
  
    // e.g., "Every 2 weekly," "Weekly," etc.
    if (interval && interval > 1) {
      return `Every ${interval} ${frequency}`;
    }
    return frequency[0].toUpperCase() + frequency.slice(1); // 'Daily', 'Weekly', etc.
  }
  