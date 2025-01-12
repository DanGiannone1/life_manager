import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from '@/components/ui/checkbox';
import { Task, RecurrenceFrequency } from '@/utils/types';
import { addTask } from '@/state/slices/taskSlice';
import { syncChanges } from '@/state/syncEngine';
import { EFFORT_DISPLAY } from '@/utils/displayMappings';
import { cn } from '@/utils/utils';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
  const dispatch = useDispatch();
  
  // Form state
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<number>(40); // Default to Medium
  const [effort, setEffort] = useState<number>(3); // Default to Medium
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (isRecurring && recurrenceInterval < 1) {
      newErrors.recurrenceInterval = 'Interval must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      userId: 'test-user', // TODO: Get from auth context
      type: 'task',
      title: title.trim(),
      status: 'notStarted',
      priority: priority,
      dynamicPriority: priority, // Initially same as priority
      effort: effort,
      notes: notes.trim() || undefined,
      dueDate: dueDate?.toISOString(),
      scheduledDate: undefined,
      createdAt: now,
      updatedAt: now,
      completionHistory: [],
      recurrence: isRecurring
        ? {
            isRecurring: true,
            rule: {
              frequency: recurrenceFrequency,
              interval: recurrenceInterval,
            },
          }
        : undefined,
    };

    // Dispatch to Redux (optimistic update)
    dispatch(addTask(newTask));

    // Sync to backend
    syncChanges('text', [
      {
        type: 'task',
        operation: 'create',
        id: newTask.id,
        data: newTask,
      },
    ]);

    // Reset form and close dialog
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setPriority(40);
    setEffort(3);
    setDueDate(undefined);
    setNotes('');
    setIsRecurring(false);
    setRecurrenceFrequency('daily');
    setRecurrenceInterval(1);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task. Add title and any additional details needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Priority Select */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority.toString()}
              onValueChange={(value) => setPriority(parseInt(value))}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Priority Level</SelectLabel>
                  <SelectItem value="80">Very High</SelectItem>
                  <SelectItem value="60">High</SelectItem>
                  <SelectItem value="40">Medium</SelectItem>
                  <SelectItem value="20">Low</SelectItem>
                  <SelectItem value="0">Very Low</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Effort Select */}
          <div className="space-y-2">
            <Label htmlFor="effort">Effort</Label>
            <Select
              value={effort.toString()}
              onValueChange={(value) => setEffort(parseInt(value))}
            >
              <SelectTrigger id="effort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Effort Level</SelectLabel>
                  {Object.entries(EFFORT_DISPLAY).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date Input */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Recurrence Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(!!checked)}
              />
              <Label htmlFor="isRecurring">Recurring Task</Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="recurrenceFrequency">Frequency</Label>
                  <Select
                    value={recurrenceFrequency}
                    onValueChange={(value) => 
                      setRecurrenceFrequency(value as RecurrenceFrequency)
                    }
                  >
                    <SelectTrigger id="recurrenceFrequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrenceInterval">
                    Repeat Every
                  </Label>
                  <Input
                    id="recurrenceInterval"
                    type="number"
                    min="1"
                    value={recurrenceInterval}
                    onChange={(e) => 
                      setRecurrenceInterval(parseInt(e.target.value) || 1)
                    }
                    className={errors.recurrenceInterval ? 'border-destructive' : ''}
                  />
                  {errors.recurrenceInterval && (
                    <p className="text-sm text-destructive">
                      {errors.recurrenceInterval}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" variant="default">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}