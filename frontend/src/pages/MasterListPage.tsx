import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import { RootState } from '../state/syncEngine';
import TaskTable from '../components/task/TaskTable';
import { AddTaskDialog } from '../components/task/AddTaskDialog';
import { Button } from '../components/ui/button';
import { Task } from '../utils/types';

const MasterListPage = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const tasksObj = useSelector((state: RootState) => state.tasks.items);
  const tasksArray: Task[] = Object.values(tasksObj);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master List</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="rounded-md border w-full">
        <TaskTable tasks={tasksArray} />
      </div>

      <AddTaskDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default MasterListPage;