import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Task } from '@/types'

interface TasksState {
  items: Record<string, Task>;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: {},
  loading: false,
  error: null,
}

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Record<string, Task>>) => {
      console.log('Setting tasks in Redux:', action.payload);
      state.items = action.payload;
      console.log('New tasks state:', state.items);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateTask: (state, action: PayloadAction<{ id: string; changes: Partial<Task> }>) => {
      const { id, changes } = action.payload;
      console.log('Updating task in Redux:', { id, changes });
      console.log('Current state for this task:', state.items[id]);
      
      if (state.items[id]) {
        state.items[id] = { ...state.items[id], ...changes };
        console.log('New state for this task:', state.items[id]);
      } else {
        console.log('Task not found in Redux state:', id);
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.items[id];
    },
    addTask: (state, action: PayloadAction<Task>) => {
      console.log('Adding task to Redux:', action.payload);
      state.items[action.payload.id] = action.payload;
      console.log('New tasks state after add:', state.items);
    },
  },
})

export const { setTasks, setLoading, setError, updateTask, deleteTask, addTask } = tasksSlice.actions
export default tasksSlice.reducer 