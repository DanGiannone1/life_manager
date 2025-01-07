import { useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { RootState } from '../../store';
import { Task, Goal, Status, STATUS_DISPLAY, PRIORITY_DISPLAY, EFFORT_DISPLAY, Category } from '../../types';
import { StatusCell } from './StatusCell';
import { InlineEdit } from './InlineEdit';
import { Button } from '../wrappers/button';
import { Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteTask } from '../../store/slices/tasksSlice';
import { deleteGoal } from '../../store/slices/goalsSlice';
import { isWithinInterval } from 'date-fns';
import { format } from "date-fns";

type Item = Task | Goal;

const ROW_HEIGHT = 56; // Adjust based on your actual row height
const HEADER_HEIGHT = 40; // Adjust based on your actual header height

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Item[];
    categories: Record<string, Category>;
    onDelete: (item: Item) => void;
  };
}

const Row = ({ index, style, data }: RowProps) => {
  const item = data.items[index];
  if (!item) return null;

  const categories = data.categories;

  return (
    <div
      style={style}
      className="flex items-center border-b border-gray-200 hover:bg-gray-50"
    >
      <div className="flex-none w-32 px-6 py-4">
        <StatusCell item={item} />
      </div>
      <div className="flex-1 px-6 py-4">
        <InlineEdit item={item} field="title" />
      </div>
      <div className="flex-none w-24 px-6 py-4">
        <div className="flex items-center">
          <div className="flex-1">
            {item.priority}
          </div>
        </div>
      </div>
      <div className="flex-none w-24 px-6 py-4">
        {item.effort && EFFORT_DISPLAY[item.effort as keyof typeof EFFORT_DISPLAY]}
      </div>
      <div className="flex-none w-32 px-6 py-4">
        {item.categoryId && categories[item.categoryId]?.name}
      </div>
      <div className="flex-none w-32 px-6 py-4">
        {item.type === 'task'
          ? (item as Task).dueDate
          : (item as Goal).timeline.targetDate}
      </div>
      <div className="flex-1 px-6 py-4">
        <InlineEdit item={item} field="notes" />
      </div>
      <div className="flex-none w-32 px-6 py-4">
        {format(new Date(item.createdAt), "PPP")}
      </div>
      <div className="flex-none w-32 px-6 py-4">
        {format(new Date(item.updatedAt), "PPP")}
      </div>
      <div className="flex-none w-24 px-6 py-4">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.type === 'task' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {item.type}
        </span>
      </div>
      <div className="flex-none w-16 px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => data.onDelete(item)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const ItemTable = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const goals = useSelector((state: RootState) => state.goals.items);
  const categories = useSelector((state: RootState) => state.categories.items);
  const filters = useSelector((state: RootState) => state.masterList.filters);
  const sort = useSelector((state: RootState) => state.masterList.sort);

  // Combine and filter items
  const items = [...Object.values(tasks), ...Object.values(goals)].filter((item) => {
    // Text search
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(item.status)) {
      return false;
    }

    // Category filter
    if (filters.categories?.length && !filters.categories.includes(item.categoryId || '')) {
      return false;
    }

    // Priority range filter
    if (filters.priorityRange) {
      const { min, max } = filters.priorityRange;
      if (item.priority < min || item.priority > max) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const itemDate = item.type === 'task' 
        ? (item as Task).dueDate 
        : (item as Goal).timeline.targetDate;
      
      if (!itemDate) return false;

      const date = new Date(itemDate);
      if (!isWithinInterval(date, { 
        start: filters.dateRange.from, 
        end: filters.dateRange.to 
      })) {
        return false;
      }
    }

    return true;
  });

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    const direction = sort.direction === 'asc' ? 1 : -1;
    
    switch (sort.column) {
      case 'title':
        return direction * a.title.localeCompare(b.title);
      case 'priority':
        return direction * (b.priority - a.priority);
      case 'createdAt':
        return direction * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'updatedAt':
        return direction * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case 'dueDate':
        const aDate = a.type === 'task' ? a.dueDate : (a as Goal).timeline.targetDate;
        const bDate = b.type === 'task' ? b.dueDate : (b as Goal).timeline.targetDate;
        if (!aDate) return direction;
        if (!bDate) return -direction;
        return direction * (new Date(aDate).getTime() - new Date(bDate).getTime());
      default:
        return 0;
    }
  });

  const handleDelete = (item: Item) => {
    if (item.type === 'task') {
      dispatch(deleteTask(item.id));
    } else {
      dispatch(deleteGoal(item.id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200" style={{ height: HEADER_HEIGHT }}>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </div>
        <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Title
        </div>
        <div className="flex-none w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Priority
        </div>
        <div className="flex-none w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Effort
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Category
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Due Date
        </div>
        <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Notes
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Created
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Updated
        </div>
        <div className="flex-none w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Type
        </div>
        <div className="flex-none w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </div>
      </div>

      {/* Virtualized List */}
      <List
        height={600} // Adjust based on your needs
        itemCount={sortedItems.length}
        itemSize={ROW_HEIGHT}
        width="100%"
        itemData={{
          items: sortedItems,
          categories,
          onDelete: handleDelete,
        }}
      >
        {Row}
      </List>
    </div>
  );
};

export default ItemTable; 