// src/state/logger.ts

import { Middleware, Action } from '@reduxjs/toolkit';
import { diff } from 'deep-object-diff';

// Helper to get a clean state diff
const getStateDiff = (prevState: any, nextState: any) => {
    const stateDiff = diff(prevState, nextState);
    return Object.keys(stateDiff).length ? stateDiff : null;
};

// Helper to format timestamps consistently
const getTimestamp = () => new Date().toISOString();

// Grouped console styling
const groupStyles = {
    init: 'color: #3f51b5; font-weight: bold;',     // Indigo for initialization
    action: 'color: #4CAF50; font-weight: bold;',    // Green for data changes
    sync: 'color: #9c27b0; font-weight: bold;',      // Purple for sync operations
    error: 'color: #f44336; font-weight: bold;'      // Red for errors
};

// Custom logger middleware for state changes
export const stateLogger: Middleware = (store) => (next) => (action: unknown) => {
    // Skip logging for sync status changes
    if ((action as Action).type === 'sync/setSyncStatus') {
        return next(action);
    }

    const timestamp = getTimestamp();
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    
    // Calculate meaningful state changes
    const stateDiff = getStateDiff(prevState, nextState);
    
    if (stateDiff) {
        const actionType = (action as Action).type;
        const style = actionType.startsWith('sync/') ? groupStyles.sync : groupStyles.action;
        
        console.groupCollapsed(`%c${actionType}`, style);
        console.log({
            type: actionType,
            payload: (action as any).payload,
            timestamp,
            changes: stateDiff
        });
        console.groupEnd();
    }
    
    return result;
};

// Sync operation logging functions
export const logSyncStarted = (changes: any[], changeType: string) => {
    console.groupCollapsed('%cSync Started', groupStyles.sync);
    console.log({
        type: 'sync/started',
        changeType,
        numChanges: changes.length,
        changes,
        timestamp: getTimestamp()
    });
    console.groupEnd();
};

export const logSyncCompleted = (syncedAt: string) => {
    console.groupCollapsed('%cSync Completed', groupStyles.sync);
    console.log({
        type: 'sync/completed',
        result: 'success',
        syncedAt,
        timestamp: getTimestamp()
    });
    console.groupEnd();
};

export const logSyncFailed = (error: unknown) => {
    console.group('%cSync Failed', groupStyles.error);
    console.log({
        type: 'sync/failed',
        error: {
            code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        },
        timestamp: getTimestamp()
    });
    console.groupEnd();
};

// Initial load logging
export const logInitialState = (state: any) => {
    console.group('%cInitial Redux State', groupStyles.init);
    console.log('State:', state);
    console.log('Tasks:', Object.keys(state.tasks.items).length);
    console.log('Sync Status:', state.sync.status);
    console.log('Last Synced:', state.sync.lastSynced);
    console.groupEnd();
};