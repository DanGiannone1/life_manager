import { SyncChange } from '@/types/api';
import { AppDispatch } from '@/store';
import { syncChangesThunk } from '@/store/thunks/syncThunks';
import { incrementPendingChanges, decrementPendingChanges } from '@/store/slices/syncSlice';

// Debounce intervals for different change types (in milliseconds)
export const DEBOUNCE_INTERVALS = {
  text: 1000,      // Text changes (title, notes) - longer delay for typing
  status: 300,     // Status changes - quick feedback
  priority: 500,   // Priority changes - medium delay
  drag: 800,       // Drag operations - balance between responsiveness and performance
  default: 1000,   // Default delay for other operations
} as const;

// Only export the change types we want components to use
export type ChangeType = 'text' | 'status' | 'priority' | 'drag';

class SmartDebounceManager {
  private timers: Map<string, NodeJS.Timeout>;
  private changes: Map<string, SyncChange[]>;
  private dispatch: AppDispatch | null;

  constructor() {
    this.timers = new Map();
    this.changes = new Map();
    this.dispatch = null;
  }

  // Initialize with the Redux dispatch function
  initialize(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  // Get the debounce interval for a change type
  private getInterval(changeType?: ChangeType): number {
    return changeType ? DEBOUNCE_INTERVALS[changeType] : DEBOUNCE_INTERVALS.default;
  }

  // Generate a key for grouping related changes
  private getChangeKey(change: SyncChange): string {
    return `${change.type}-${change.changeType || 'default'}`;
  }

  // Add a change to be synced
  addChange(change: SyncChange) {
    if (!this.dispatch) {
      throw new Error('SmartDebounceManager not initialized with dispatch');
    }

    const key = this.getChangeKey(change);
    const interval = this.getInterval(change.changeType as ChangeType);

    // Add the change to our collection
    const existingChanges = this.changes.get(key) || [];
    this.changes.set(key, [...existingChanges, change]);

    // Increment pending changes counter
    this.dispatch(incrementPendingChanges());

    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.syncChanges(key);
    }, interval);

    this.timers.set(key, timer);
  }

  // Sync changes for a specific key
  private async syncChanges(key: string) {
    if (!this.dispatch) {
      throw new Error('SmartDebounceManager not initialized with dispatch');
    }

    const changes = this.changes.get(key) || [];
    if (changes.length === 0) return;

    try {
      // Clear the changes before syncing to prevent duplicates
      this.changes.delete(key);
      this.timers.delete(key);

      // Dispatch the sync thunk
      await this.dispatch(syncChangesThunk(changes));

      // Decrement pending changes counter for each change
      changes.forEach(() => {
        this.dispatch!(decrementPendingChanges());
      });
    } catch (error) {
      console.error('Error syncing changes:', error);
      // Note: The sync thunk already handles setting error status
      // and retry logic, so we don't need additional error handling here
    }
  }

  // Force sync all pending changes
  async syncAll() {
    if (!this.dispatch) {
      throw new Error('SmartDebounceManager not initialized with dispatch');
    }

    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    // Collect all changes
    const allChanges: SyncChange[] = [];
    for (const changes of this.changes.values()) {
      allChanges.push(...changes);
    }
    this.changes.clear();

    if (allChanges.length > 0) {
      try {
        await this.dispatch(syncChangesThunk(allChanges));
        // Decrement pending changes counter for each change
        allChanges.forEach(() => {
          this.dispatch!(decrementPendingChanges());
        });
      } catch (error) {
        console.error('Error syncing all changes:', error);
      }
    }
  }

  // Clear all pending changes without syncing
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.changes.clear();
  }
}

// Export a singleton instance
export const smartDebounceManager = new SmartDebounceManager(); 