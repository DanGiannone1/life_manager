import { useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { RootState } from '../../store';
import { Task, STATUS_DISPLAY, PRIORITY_DISPLAY, EFFORT_DISPLAY, Category } from '../../types';
import { StatusCell } from './StatusCell';
import { InlineEdit } from './InlineEdit';
import { format } from "date-fns";

const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 40;

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Task[];
    categories: Record<string, Category>;
  };
}

const getPriorityDisplay = (priority: number) => {
  const range = PRIORITY_DISPLAY.ranges.find(r => priority >= r.min);
  return {
    label: range?.label || 'Unknown',
    color: range?.color || 'gray.500'
  };
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  return format(new Date(dateString), "MM-dd-yy");
};

const Row = ({ index, style, data }: RowProps) => {
  const task = data.items[index];
  console.log('Rendering row for task:', task);
  if (!task) return null;

  const categories = data.categories;
  const priority = getPriorityDisplay(task.priority);

  return (
    <div
      style={style}
      className="flex items-center border-b border-gray-200 hover:bg-gray-50"
    >
      <div className="flex-1 px-6 py-4 border-r border-gray-100">
        <InlineEdit item={task} field="title" />
      </div>
      <div className="flex-none w-32 px-6 py-4 border-r border-gray-100">
        <StatusCell item={task} />
      </div>
      <div className="flex-none w-24 px-6 py-4 border-r border-gray-100">
        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
          priority.color.includes('red') ? 'bg-red-100 text-red-800' :
          priority.color.includes('orange') ? 'bg-orange-100 text-orange-800' :
          priority.color.includes('yellow') ? 'bg-yellow-100 text-yellow-800' :
          priority.color.includes('green') ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {priority.label}
        </span>
      </div>
      <div className="flex-none w-24 px-6 py-4 border-r border-gray-100">
        {task.effort && EFFORT_DISPLAY[task.effort as keyof typeof EFFORT_DISPLAY]}
      </div>
      <div className="flex-none w-32 px-6 py-4 border-r border-gray-100">
        {task.categoryId && categories[task.categoryId]?.name}
      </div>
      <div className="flex-none w-32 px-6 py-4 border-r border-gray-100">
        {formatDate(task.dueDate)}
      </div>
      <div className="flex-1 px-6 py-4 border-r border-gray-100">
        <InlineEdit item={task} field="notes" />
      </div>
      <div className="flex-none w-32 px-6 py-4 border-r border-gray-100">
        {formatDate(task.createdAt)}
      </div>
      <div className="flex-none w-32 px-6 py-4 border-r border-gray-100">
        {formatDate(task.updatedAt)}
      </div>
    </div>
  );
};

export const ItemTable = () => {
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const categories = useSelector((state: RootState) => state.categories.items);
  const filters = useSelector((state: RootState) => state.masterList.filters);
  const sort = useSelector((state: RootState) => state.masterList.sort);

  console.log('Current tasks in Redux:', tasks);
  console.log('Current filters:', filters);

  // Filter tasks
  const filteredTasks = Object.values(tasks).filter((task) => {
    // Text search
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    // Category filter
    if (filters.categories?.length && !filters.categories.includes(task.categoryId || '')) {
      return false;
    }

    // Priority range filter
    if (filters.priorityRange) {
      const { min, max } = filters.priorityRange;
      if (task.priority < min || task.priority > max) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      if (!task.dueDate) return false;

      const date = new Date(task.dueDate);
      const from = new Date(filters.dateRange.from);
      const to = new Date(filters.dateRange.to);
      
      if (date < from || date > to) {
        return false;
      }
    }

    return true;
  });

  console.log('Filtered tasks:', filteredTasks);

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
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
        if (!a.dueDate) return direction;
        if (!b.dueDate) return -direction;
        return direction * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      default:
        return 0;
    }
  });

  console.log('Sorted tasks:', sortedTasks);
  console.log('List height:', 600);
  console.log('Row height:', ROW_HEIGHT);
  console.log('Item count:', sortedTasks.length);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200" style={{ height: HEADER_HEIGHT }}>
        <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Title
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Status
        </div>
        <div className="flex-none w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Priority
        </div>
        <div className="flex-none w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Effort
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Category
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Due Date
        </div>
        <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Notes
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Created
        </div>
        <div className="flex-none w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Updated
        </div>
      </div>

      {/* Virtualized List */}
      <List
        height={600}
        itemCount={sortedTasks.length}
        itemSize={ROW_HEIGHT}
        width="100%"
        itemData={{
          items: sortedTasks,
          categories,
        }}
      >
        {Row}
      </List>
    </div>
  );
};

export default ItemTable; 