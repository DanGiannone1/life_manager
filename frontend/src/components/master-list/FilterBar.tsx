import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setSearch,
  toggleStatus,
  setCategories,
  setPriorityRange,
  setDateRange,
  setSort,
  resetFilters,
  toggleFilterBar,
} from '../../store/slices/masterListSlice';
import { Button } from '../wrappers/button';
import { Input } from '../wrappers/input';
import { Select } from '../wrappers/select';
import { DatePicker } from '../wrappers/date-picker';
import { STATUS_DISPLAY, PRIORITY_DISPLAY } from '../../types';
import { Category, Status } from '../../types';
import { DateRange } from 'react-day-picker';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FilterBar = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.masterList.filters);
  const sort = useSelector((state: RootState) => state.masterList.sort);
  const categories = useSelector((state: RootState) => state.categories.items);
  const isExpanded = useSelector((state: RootState) => state.masterList.view.filterBarExpanded);

  const handleSearchChange = (value: string) => {
    dispatch(setSearch(value));
  };

  const handleStatusToggle = (status: Status) => {
    dispatch(toggleStatus(status));
  };

  const handleCategoryChange = (value: string) => {
    dispatch(setCategories([value]));
  };

  const handlePriorityChange = (value: string) => {
    if (!value) {
      dispatch(setPriorityRange({ min: 0, max: 100 }));
      return;
    }
    const parts = value.split('-');
    if (parts.length === 2 && parts[0] && parts[1]) {
      const min = parseInt(parts[0], 10);
      const max = parseInt(parts[1], 10);
      if (!isNaN(min) && !isNaN(max)) {
        dispatch(setPriorityRange({ min, max }));
      }
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    dispatch(setDateRange(range));
  };

  const handleSortChange = (value: string) => {
    const [column, direction] = value.split('-') as [string, 'asc' | 'desc'];
    dispatch(setSort({ column, direction }));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search and Toggle */}
      <div className="p-4 flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search tasks and goals..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(toggleFilterBar())}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 border-gray-200"
        >
          {isExpanded ? (
            <>
              Hide Filters
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show Filters
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Expandable Filter Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t"
          >
            <div className="p-4 space-y-4">
              {/* Status Pills */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_DISPLAY).map(([status, label]) => (
                  <Button
                    key={status}
                    variant={filters.status.includes(status as Status) ? 'default' : 'outline'}
                    onClick={() => handleStatusToggle(status as Status)}
                    size="sm"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Sort Controls */}
              <div className="flex gap-4">
                <Select
                  value={`${sort.column}-${sort.direction}`}
                  onChange={handleSortChange}
                  options={[
                    { value: 'title-asc', label: 'Title (A-Z)' },
                    { value: 'title-desc', label: 'Title (Z-A)' },
                    { value: 'priority-desc', label: 'Priority (High-Low)' },
                    { value: 'priority-asc', label: 'Priority (Low-High)' },
                    { value: 'dueDate-asc', label: 'Due Date (Earliest)' },
                    { value: 'dueDate-desc', label: 'Due Date (Latest)' },
                    { value: 'createdAt-desc', label: 'Created (Newest)' },
                    { value: 'createdAt-asc', label: 'Created (Oldest)' },
                    { value: 'updatedAt-desc', label: 'Updated (Newest)' },
                    { value: 'updatedAt-asc', label: 'Updated (Oldest)' },
                  ]}
                />
              </div>

              {/* Priority Range */}
              <div>
                <Select
                  value={filters.priorityRange ? `${filters.priorityRange.min}-${filters.priorityRange.max}` : ''}
                  onChange={handlePriorityChange}
                  options={PRIORITY_DISPLAY.ranges.map((range) => ({
                    value: `${range.min}-100`,
                    label: range.label,
                  }))}
                  placeholder="Select Priority Range"
                />
              </div>

              {/* Categories */}
              <div>
                <Select
                  value={filters.categories?.[0] || ''}
                  onChange={handleCategoryChange}
                  options={Object.values(categories).map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  placeholder="Select Category"
                />
              </div>

              {/* Date Range */}
              <div>
                <DatePicker
                  selected={filters.dateRange}
                  onSelect={handleDateRangeChange}
                  placeholder="Select Date Range"
                  showClearButton
                  onClear={() => dispatch(setDateRange(undefined))}
                />
              </div>

              {/* Reset Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => dispatch(resetFilters())}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar; 