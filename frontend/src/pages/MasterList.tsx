import { FilterBar } from "@/components/master-list/FilterBar";
import { ItemTable } from "@/components/master-list/ItemTable";
import { AddTaskDialog } from "@/components/master-list/AddTaskDialog";

export const MasterList = () => {
  return (
    <div className="container mx-auto max-w-[95%] space-y-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Master List</h1>
        <div className="flex gap-2">
          <AddTaskDialog />
        </div>
      </div>
      <FilterBar />
      <ItemTable />
    </div>
  );
};

export default MasterList; 