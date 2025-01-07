import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/wrappers/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/wrappers/dialog";
import { Input } from "@/components/wrappers/input";
import { Select } from "@/components/wrappers/select";
import { Plus } from "lucide-react";
import { useAppDispatch } from "@/store";
import { addTask } from "@/store/slices/tasksSlice";
import { useSync } from "@/hooks/useSync";
import { Task } from "@/types";

export function AddTaskDialog() {
  const dispatch = useAppDispatch();
  const { handleChange } = useSync();
  
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("50");
  const [effort, setEffort] = useState("1");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setPriority("50");
    setEffort("1");
    setCategory("");
    setDueDate("");
    setNotes("");
  };

  const handleCreateTask = () => {
    const newId = uuidv4();
    const now = new Date().toISOString();
    
    const newTask: Task = {
      id: newId,
      userId: "test-user-id", // Replace with real user ID from auth context
      type: "task",
      title,
      status: "notStarted",
      priority: parseInt(priority, 10),
      dynamicPriority: parseInt(priority, 10),
      createdAt: now,
      updatedAt: now,
      statusHistory: [],
      completionHistory: [],
      ...(effort && { effort: parseInt(effort, 10) }),
      ...(category && { categoryId: category }),
      ...(dueDate && { dueDate }),
      ...(notes && { notes }),
    };

    // 1) Optimistically add to Redux
    dispatch(addTask(newTask));

    // 2) Queue sync for creation
    handleChange("task", "create", newTask, undefined, newId);

    // 3) Reset form and close dialog
    handleClose();
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Task
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Enter the details for your new task below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Select
                options={[
                  { value: "100", label: "Very High" },
                  { value: "80", label: "High" },
                  { value: "50", label: "Medium" },
                  { value: "20", label: "Low" },
                  { value: "0", label: "Very Low" },
                ]}
                value={priority}
                onChange={(val) => setPriority(val)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Effort</label>
              <Select
                options={[
                  { value: "1", label: "1 - Quick" },
                  { value: "2", label: "2 - Small" },
                  { value: "3", label: "3 - Medium" },
                  { value: "5", label: "5 - Large" },
                  { value: "8", label: "8 - Very Large" },
                  { value: "13", label: "13 - Huge" },
                ]}
                value={effort}
                onChange={(val) => setEffort(val)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select
                options={[
                  { value: "work", label: "Work" },
                  { value: "personal", label: "Personal" },
                  { value: "health", label: "Health" },
                  { value: "finance", label: "Finance" },
                  { value: "education", label: "Education" },
                  { value: "other", label: "Other" },
                ]}
                value={category}
                onChange={(val) => setCategory(val)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 