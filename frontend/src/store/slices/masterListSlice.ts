import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status, UUID } from '../../types';
import { DateRange } from 'react-day-picker';

interface MasterListState {
  filters: {
    search: string;
    status: Status[];
    categories?: UUID[];
    priorityRange?: {
      min: number;
      max: number;
    };
    dateRange?: DateRange | undefined;
  };
  sort: {
    column: string;
    direction: 'asc' | 'desc';
  };
  view: {
    filterBarExpanded: boolean;
  };
}

const initialState: MasterListState = {
  filters: {
    search: '',
    status: [],
  },
  sort: {
    column: 'updatedAt',
    direction: 'desc',
  },
  view: {
    filterBarExpanded: false,
  },
};

export const masterListSlice = createSlice({
  name: 'masterList',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    toggleStatus: (state, action: PayloadAction<Status>) => {
      const index = state.filters.status.indexOf(action.payload);
      if (index === -1) {
        state.filters.status.push(action.payload);
      } else {
        state.filters.status.splice(index, 1);
      }
    },
    setCategories: (state, action: PayloadAction<UUID[]>) => {
      state.filters.categories = action.payload;
    },
    setPriorityRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.filters.priorityRange = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange | undefined>) => {
      state.filters.dateRange = action.payload;
    },
    setSort: (state, action: PayloadAction<{ column: string; direction: 'asc' | 'desc' }>) => {
      state.sort = action.payload;
    },
    toggleFilterBar: (state) => {
      state.view.filterBarExpanded = !state.view.filterBarExpanded;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setSearch,
  toggleStatus,
  setCategories,
  setPriorityRange,
  setDateRange,
  setSort,
  toggleFilterBar,
  resetFilters,
} = masterListSlice.actions;

export default masterListSlice.reducer; 