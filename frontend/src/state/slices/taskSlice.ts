// File: frontend/src/state/slices/taskSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksState, UUID } from '../../utils/types';

const initialState: TasksState = {
  items: {},
  loading: false,
  error: null
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Add a single task to the dictionary.
     */
    addTask: (state, action: PayloadAction<Task>) => {
      state.items[action.payload.id] = action.payload;
    },

    /**
     * Update an existing task by its id.
     */
    updateTask: (state, action: PayloadAction<{ id: UUID; changes: Partial<Task> }>) => {
      const { id, changes } = action.payload;
      if (state.items[id]) {
        state.items[id] = { ...state.items[id], ...changes };
      } else {
        console.log('[updateTask] Task not found in store:', id);
      }
    },

    /**
     * Delete a task from the dictionary by its id.
     */
    deleteTask: (state, action: PayloadAction<UUID>) => {
      delete state.items[action.payload];
    },

    /**
     * Set an entire collection of tasks in the store. 
     * Accepts EITHER:
     *   1) A dictionary of tasks keyed by ID, OR
     *   2) An array of tasks
     * We convert arrays to a dictionary automatically.
     */
    setTasks: (
      state,
      action: PayloadAction<Record<UUID, Task> | Task[]>
    ) => {
      const payload = action.payload;

      if (Array.isArray(payload)) {
        // If payload is an array, convert it to a dictionary
        const record: Record<string, Task> = {};
        payload.forEach((task) => {
          record[task.id] = task;
        });
        state.items = record;
      } else {
        // If it's already a dictionary, just store it
        state.items = payload;
      }
    }
  }
});

// Export all of the action creators
export const {
  setLoading,
  setError,
  addTask,
  updateTask,
  deleteTask,
  setTasks
} = taskSlice.actions;

// Export the reducer to be included in your store
export default taskSlice.reducer;
