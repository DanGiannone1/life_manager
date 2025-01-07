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
      state.items = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateTask: (state, action: PayloadAction<{ id: string; changes: Partial<Task> }>) => {
      const { id, changes } = action.payload;
      if (state.items[id]) {
        state.items[id] = { ...state.items[id], ...changes };
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.items[id];
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.items[action.payload.id] = action.payload;
    },
  },
})

export const { setTasks, setLoading, setError, updateTask, deleteTask, addTask } = tasksSlice.actions
export default tasksSlice.reducer 