import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type SyncStatus = 'idle' | 'syncing' | 'error'

interface SyncState {
  status: SyncStatus;
  lastSynced: string | null;
  pendingChanges: number;
  error: string | null;
}

const initialState: SyncState = {
  status: 'idle',
  lastSynced: null,
  pendingChanges: 0,
  error: null,
}

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.status = action.payload;
      // Clear error when status changes to anything but error
      if (action.payload !== 'error') {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    setLastSynced: (state, action: PayloadAction<string>) => {
      // Only update lastSynced if we're not in an error state
      if (state.status !== 'error') {
        state.lastSynced = action.payload;
      }
    },
    incrementPendingChanges: (state) => {
      state.pendingChanges += 1;
    },
    decrementPendingChanges: (state) => {
      state.pendingChanges = Math.max(0, state.pendingChanges - 1);
    },
    resetPendingChanges: (state) => {
      state.pendingChanges = 0;
    },
  },
})

export const { 
  setStatus, 
  setError,
  setLastSynced, 
  incrementPendingChanges, 
  decrementPendingChanges,
  resetPendingChanges,
} = syncSlice.actions

export default syncSlice.reducer 