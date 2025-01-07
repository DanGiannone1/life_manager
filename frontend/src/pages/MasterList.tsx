import { FilterBar } from "@/components/master-list/FilterBar";
import { ItemTable } from "@/components/master-list/ItemTable";
import { AddTaskDialog } from "@/components/master-list/AddTaskDialog";
import { AddGoalDialog } from "@/components/master-list/AddGoalDialog";

export const MasterList = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Master List</h1>
        <div className="flex gap-2 p-2">
          <AddTaskDialog />
          <AddGoalDialog />
        </div>
      </div>
      <FilterBar />
      <ItemTable />
    </div>
  );
};

export default MasterList; 