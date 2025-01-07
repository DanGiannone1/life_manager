import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import tasksReducer from './slices/tasksSlice'
import goalsReducer from './slices/goalsSlice'
import categoriesReducer from './slices/categoriesSlice'
import dashboardReducer from './slices/dashboardSlice'
import syncReducer from './slices/syncSlice'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    goals: goalsReducer,
    categories: categoriesReducer,
    dashboard: dashboardReducer,
    sync: syncReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector 