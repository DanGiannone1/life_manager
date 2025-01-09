import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserData, syncChanges, getRetryDelay, RETRY_CONFIG } from '@/services/api';
import { setTasks } from '../slices/tasksSlice';
import { setGoals } from '../slices/goalsSlice';
import { setCategories } from '../slices/categoriesSlice';
import { setWidgets } from '../slices/dashboardSlice';
import { setStatus, setLastSynced, resetPendingChanges, setError } from '../slices/syncSlice';
import type { RootState } from '../index';
import type { SyncChange } from '@/types/api';
import type { Task } from '@/types';

// Fetch all user data
export const fetchUserDataThunk = createAsyncThunk(
  'sync/fetchUserData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setStatus('syncing'));
      const response = await fetchUserData();
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch user data: Invalid response');
      }

      console.log('Received tasks from API:', response.data.tasks);
      
      // Update all slices with the fetched data
      dispatch(setTasks(response.data.tasks));
      dispatch(setGoals(response.data.goals));
      dispatch(setCategories(response.data.categories));
      if (response.data.dashboard) {
        dispatch(setWidgets(response.data.dashboard.widgets));
      }
      dispatch(setLastSynced(response.data.lastSyncedAt));
      dispatch(setStatus('idle'));
      return response.data;
    } catch (error) {
      dispatch(setStatus('error'));
      // Don't update lastSynced on error
      return rejectWithValue(error);
    }
  }
);

// Sync changes with retry logic
export const syncChangesThunk = createAsyncThunk(
  'sync/syncChanges',
  async (changes: SyncChange[], { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    let attempt = 0;
    
    while (attempt < RETRY_CONFIG.maxRetries) {
      try {
        dispatch(setStatus('syncing'));
        
        const response = await syncChanges({
          changes,
          clientLastSync: state.sync.lastSynced || new Date().toISOString(),
        });
        
        if (!response.success || !response.data) {
          throw new Error('Sync failed: Invalid response');
        }

        // Process any server changes
        if (response.data.serverChanges?.length) {
          for (const change of response.data.serverChanges) {
            switch (change.type) {
              case 'task':
                if (change.operation === 'delete') {
                  // Handle delete
                } else if (change.data) {
                  dispatch(setTasks({ [change.data.id]: change.data }));
                }
                break;
              case 'goal':
                if (change.operation === 'delete') {
                  // Handle delete
                } else if (change.data) {
                  dispatch(setGoals({ [change.data.id]: change.data }));
                }
                break;
              case 'category':
                if (change.operation === 'delete') {
                  // Handle delete
                } else if (change.data) {
                  dispatch(setCategories({ [change.data.id]: change.data }));
                }
                break;
              case 'dashboard':
                if (change.operation === 'delete') {
                  // Handle delete
                } else if (change.data) {
                  dispatch(setWidgets(change.data.widgets));
                }
                break;
            }
          }
        }
        
        // Only update lastSynced and reset status if we successfully processed everything
        dispatch(setLastSynced(response.data.syncedAt));
        dispatch(resetPendingChanges());
        dispatch(setStatus('idle'));
        return response.data;
      } catch (error) {
        attempt++;
        
        // On final retry, set error status and reject
        if (attempt === RETRY_CONFIG.maxRetries) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
          dispatch(setError(errorMessage));
          return rejectWithValue(error);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
      }
    }
  }
); 