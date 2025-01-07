import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { smartDebounceManager, ChangeType } from '@/utils/SmartDebounceManager';
import { fetchUserDataThunk } from '@/store/thunks/syncThunks';
import type { SyncChange } from '@/types/api';

export function useSync() {
  const dispatch = useAppDispatch();
  const syncStatus = useAppSelector(state => state.sync.status);
  const lastSynced = useAppSelector(state => state.sync.lastSynced);
  const pendingChanges = useAppSelector(state => state.sync.pendingChanges);

  // Initialize the SmartDebounceManager with dispatch
  useEffect(() => {
    smartDebounceManager.initialize(dispatch);
  }, [dispatch]);

  // Function to handle changes that need to be synced
  const handleChange = useCallback((
    type: SyncChange['type'],
    operation: SyncChange['operation'],
    data: any,
    changeType?: ChangeType,
    id?: string
  ) => {
    // Ensure id is provided for update and delete operations
    if ((operation === 'update' || operation === 'delete') && !id) {
      throw new Error(`ID is required for ${operation} operation`);
    }

    const change: SyncChange = {
      type,
      operation,
      ...(id && { id }), // Only include id if it's provided
      data,
      timestamp: new Date().toISOString(),
      ...(changeType && { changeType }), // Only include changeType if it's provided
    };

    smartDebounceManager.addChange(change);
  }, []);

  // Function to force sync all pending changes
  const syncAll = useCallback(async () => {
    await smartDebounceManager.syncAll();
  }, []);

  // Function to load initial data
  const loadInitialData = useCallback(async () => {
    await dispatch(fetchUserDataThunk());
  }, [dispatch]);

  // Function to clear all pending changes
  const clearChanges = useCallback(() => {
    smartDebounceManager.clear();
  }, []);

  return {
    syncStatus,
    lastSynced,
    pendingChanges,
    handleChange,
    syncAll,
    loadInitialData,
    clearChanges,
  };
}

// Example usage in a component:
/*
function TaskComponent({ task }) {
  const { handleChange } = useSync();

  const onTitleChange = (newTitle: string) => {
    handleChange(
      'task',
      'update',
      { ...task, title: newTitle },
      'text',
      task.id
    );
  };

  const onStatusChange = (newStatus: Status) => {
    handleChange(
      'task',
      'update',
      { 
        ...task, 
        status: newStatus,
        statusHistory: [
          ...task.statusHistory,
          {
            status: newStatus,
            changedAt: new Date().toISOString(),
          }
        ]
      },
      'status',
      task.id
    );
  };

  // ... rest of the component
}
*/ 