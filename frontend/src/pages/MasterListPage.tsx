import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/syncEngine';
import TaskTable from '../components/task/TaskTable';
import { Task } from '../utils/types';

const MasterListPage = () => {
  const tasksObj = useSelector((state: RootState) => state.tasks.items);
  const tasksArray: Task[] = Object.values(tasksObj);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Master List</h1>
      <div className="rounded-md border w-full">
        <TaskTable tasks={tasksArray} />
      </div>
    </div>
  );
};

export default MasterListPage; 