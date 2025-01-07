import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DashboardWidget } from '@/types'

interface DashboardState {
  widgets: DashboardWidget[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  widgets: [],
  loading: false,
  error: null,
}

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setWidgets: (state, action: PayloadAction<DashboardWidget[]>) => {
      state.widgets = action.payload
    },
    addWidget: (state, action: PayloadAction<DashboardWidget>) => {
      state.widgets.push(action.payload)
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(widget => widget.id !== action.payload)
    },
    updateWidget: (state, action: PayloadAction<DashboardWidget>) => {
      const index = state.widgets.findIndex(widget => widget.id === action.payload.id)
      if (index !== -1) {
        state.widgets[index] = action.payload
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { 
  setWidgets, 
  addWidget, 
  removeWidget, 
  updateWidget, 
  setLoading, 
  setError 
} = dashboardSlice.actions

export default dashboardSlice.reducer 