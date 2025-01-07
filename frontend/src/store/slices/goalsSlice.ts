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
  },
})

export const { setGoals, setLoading, setError } = goalsSlice.actions
export default goalsSlice.reducer 