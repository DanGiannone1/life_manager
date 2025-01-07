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
  },
})

export const { setTasks, setLoading, setError } = tasksSlice.actions
export default tasksSlice.reducer 