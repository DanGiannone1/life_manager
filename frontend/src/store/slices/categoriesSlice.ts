import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Category } from '@/types'

interface CategoriesState {
  items: Record<string, Category>;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: {},
  loading: false,
  error: null,
}

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Record<string, Category>>) => {
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

export const { setCategories, setLoading, setError } = categoriesSlice.actions
export default categoriesSlice.reducer 