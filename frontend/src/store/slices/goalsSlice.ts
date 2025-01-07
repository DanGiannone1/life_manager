import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Goal } from '@/types'

interface GoalsState {
  items: Record<string, Goal>;
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  items: {},
  loading: false,
  error: null,
}

export const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<Record<string, Goal>>) => {
      state.items = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateGoal: (state, action: PayloadAction<{ id: string; changes: Partial<Goal> }>) => {
      const { id, changes } = action.payload;
      if (state.items[id]) {
        state.items[id] = { ...state.items[id], ...changes };
      }
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.items[id];
    },
    addGoal: (state, action: PayloadAction<Goal>) => {
      state.items[action.payload.id] = action.payload;
    },
  },
})

export const { setGoals, setLoading, setError, updateGoal, deleteGoal, addGoal } = goalsSlice.actions
export default goalsSlice.reducer 