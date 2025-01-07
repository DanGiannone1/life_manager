import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type SyncStatus = 'idle' | 'syncing' | 'error'

interface SyncState {
  status: SyncStatus;
  lastSynced: string | null;
  pendingChanges: number;
}

const initialState: SyncState = {
  status: 'idle',
  lastSynced: null,
  pendingChanges: 0,
}

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.status = action.payload
    },
    setLastSynced: (state, action: PayloadAction<string>) => {
      state.lastSynced = action.payload
    },
    incrementPendingChanges: (state) => {
      state.pendingChanges += 1
    },
    decrementPendingChanges: (state) => {
      state.pendingChanges = Math.max(0, state.pendingChanges - 1)
    },
    resetPendingChanges: (state) => {
      state.pendingChanges = 0
    },
  },
})

export const { 
  setStatus, 
  setLastSynced, 
  incrementPendingChanges, 
  decrementPendingChanges,
  resetPendingChanges,
} = syncSlice.actions

export default syncSlice.reducer 