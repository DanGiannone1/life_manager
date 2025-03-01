// src/state/syncEngine.ts

import { configureStore } from '@reduxjs/toolkit';
import { debounce } from 'lodash';
import taskReducer, {
  setTasks
} from './slices/taskSlice';
import syncReducer, {
  setSyncStatus,
  setLastSynced,
  resetPendingChanges
} from './slices/syncSlice';
import { api } from '../utils/api';
import { Task, UUID, ChangeType } from '../utils/types';
import {
  stateLogger,
  logSyncStarted,
  logSyncCompleted,
  logSyncFailed,
  logInitialState
} from './logger';

/**
 * Configure the Redux store
 */
export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    sync: syncReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types in serializability checks
        ignoredActions: ['sync/setLastSynced']
      }
    }).concat(stateLogger)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Sync configuration for each type of UI change
 */
const SYNC_CONFIG: Record<ChangeType, number> = {
  text: 2000,      // 2 seconds for text changes
  status: 500,     // 500ms for status changes
  priority: 1000,  // 1 second for priority changes
  drag: 500        // 500ms for drag operations
};

/**
 * Initialize data on app start
 */
export const initializeData = async () => {
  try {
    store.dispatch(setSyncStatus('syncing'));

    const userData = await api.getUserData();
    store.dispatch(setTasks(userData.tasks));
    store.dispatch(setLastSynced(userData.lastSyncedAt));

    store.dispatch(setSyncStatus('idle'));
    logInitialState(store.getState());
  } catch (error) {
    console.error('Failed to initialize data:', error);
    store.dispatch(setSyncStatus('error'));
  }
};

/**
 * Debounced sync functions (FIRE AND FORGET!)
 *
 * Each function logs the start, sets the store to 'syncing',
 * but does NOT await the result. We handle success/failure in then/catch.
 */
const debouncedSyncs = Object.entries(SYNC_CONFIG).reduce(
  (acc, [changeType, delay]) => {
    acc[changeType as ChangeType] = debounce((changes: Array<{
      type: 'task';
      operation: 'create' | 'update' | 'delete';
      id?: UUID;
      data?: Partial<Task>;
    }>) => {
      // 1) Log sync start in console
      logSyncStarted(changes, changeType);
      // 2) Set store to 'syncing' so top panel can show spinner
      store.dispatch(setSyncStatus('syncing'));

      const syncRequest = {
        changes: changes.map((change) => ({
          ...change,
          timestamp: new Date().toISOString(),
          changeType: changeType as ChangeType
        })),
        // fallback to "now" if we don't have lastSynced
        clientLastSync: store.getState().sync.lastSynced || new Date().toISOString()
      };

      // ===== Fire-and-forget: NO `await` here =====
      api.sync(syncRequest)
        .then((response) => {
          // Sync is done - just update sync status
          store.dispatch(setLastSynced(response.syncedAt));
          store.dispatch(setSyncStatus('idle'));
          store.dispatch(resetPendingChanges());

          logSyncCompleted(response.syncedAt);
        })
        .catch((error) => {
          logSyncFailed(error);
          // Mark the store as 'error', so top panel can show "sync error"
          store.dispatch(setSyncStatus('error'));
        });
    }, delay);

    return acc;
  },
  {} as Record<ChangeType, Function>
);

/**
 * Export a helper so components can queue changes
 */
export const syncChanges = (
  changeType: ChangeType,
  changes: Array<{
    type: 'task';
    operation: 'create' | 'update' | 'delete';
    id?: UUID;
    data?: Partial<Task>;
  }>
) => {
  debouncedSyncs[changeType](changes);
};
