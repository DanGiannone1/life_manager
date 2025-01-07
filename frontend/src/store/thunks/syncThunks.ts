import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserData, syncChanges, getRetryDelay, RETRY_CONFIG } from '@/services/api';
import { setTasks } from '../slices/tasksSlice';
import { setGoals } from '../slices/goalsSlice';
import { setCategories } from '../slices/categoriesSlice';
import { setWidgets } from '../slices/dashboardSlice';
import { setStatus, setLastSynced, resetPendingChanges } from '../slices/syncSlice';
import type { RootState } from '../index';
import type { SyncChange } from '@/types/api';

// Fetch all user data
export const fetchUserDataThunk = createAsyncThunk(
  'sync/fetchUserData',
  async (_, { dispatch }) => {
    try {
      dispatch(setStatus('syncing'));
      const response = await fetchUserData();
      
      if (response.success && response.data) {
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
      }
      
      throw new Error('Failed to fetch user data');
    } catch (error) {
      dispatch(setStatus('error'));
      throw error;
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
        
        if (response.success && response.data) {
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
          
          dispatch(setLastSynced(response.data.syncedAt));
          dispatch(resetPendingChanges());
          dispatch(setStatus('idle'));
          return response.data;
        }
        
        throw new Error('Sync failed');
      } catch (error) {
        attempt++;
        if (attempt === RETRY_CONFIG.maxRetries) {
          dispatch(setStatus('error'));
          return rejectWithValue(error);
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
      }
    }
  }
); 