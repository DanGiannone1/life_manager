import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SyncState } from '../../utils/types';

const initialState: SyncState = {
    status: 'idle',
    lastSynced: null,
    pendingChanges: 0
};

export const syncSlice = createSlice({
    name: 'sync',
    initialState,
    reducers: {
        setSyncStatus: (state, action: PayloadAction<'idle' | 'syncing' | 'error'>) => {
            state.status = action.payload;
        },
        setLastSynced: (state, action: PayloadAction<string | null>) => {
            state.lastSynced = action.payload;
        },
        incrementPendingChanges: (state) => {
            state.pendingChanges += 1;
        },
        decrementPendingChanges: (state) => {
            if (state.pendingChanges > 0) {
                state.pendingChanges -= 1;
            }
        },
        resetPendingChanges: (state) => {
            state.pendingChanges = 0;
        }
    }
});

export const {
    setSyncStatus,
    setLastSynced,
    incrementPendingChanges,
    decrementPendingChanges,
    resetPendingChanges
} = syncSlice.actions;

export default syncSlice.reducer; 