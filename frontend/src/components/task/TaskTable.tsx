// File: src/components/task/TaskTable.tsx


import { Task } from '../../utils/types'; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import TaskTableRow from './TaskTableRow';

interface TaskTableProps {
  tasks: Task[];
}

const TaskTable = ({ tasks }: TaskTableProps) => {
  return (
    <div className="w-full rounded-lg border bg-card shadow-sm">
      {/* Table title area */}
      <div className="px-4 py-3 border-b bg-muted/30 rounded-t-lg">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
      </div>

      {/* Main table */}
      <Table className="min-w-full text-sm">
        <TableHeader>
          <TableRow className="bg-muted/20 text-muted-foreground">
            <TableHead className="py-3 px-4 font-medium">Title</TableHead>
            <TableHead className="py-3 px-4 font-medium">Status</TableHead>
            <TableHead className="py-3 px-4 font-medium">Priority</TableHead>
            <TableHead className="py-3 px-4 font-medium">Effort</TableHead>
            <TableHead className="py-3 px-4 font-medium">Due Date</TableHead>
            <TableHead className="py-3 px-4 font-medium">Recurrence</TableHead>
            <TableHead className="py-3 px-4 font-medium">Notes</TableHead>
            <TableHead className="py-3 px-4 font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.map((task) => (
            <TaskTableRow key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="p-4 text-center text-sm text-muted-foreground"
              >
                No tasks available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
