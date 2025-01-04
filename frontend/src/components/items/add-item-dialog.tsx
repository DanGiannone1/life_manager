'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from '@/contexts/app-context';
import { TaskItem, GoalItem, Priority, Status, ItemType } from '@/types/items';

interface AddItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onItemAdded?: () => void;
}

const PRIORITY_MAP: Record<Priority, number> = {
    'Very High': 90,
    'High': 70,
    'Medium': 50,
    'Low': 30,
    'Very Low': 10
};

type BaseFormData = {
    userId: string;
    title: string;
    type: ItemType;
    status: Status;
    priority: number;
    displayPriority: Priority;
    notes: string;
    categoryId: string;
    subcategoryId: string;
    completionHistory: Array<{ completedAt: string, nextDueDate: string }>;
};

type TaskFormData = BaseFormData & {
    type: 'task';
    dueDate: string;
    isRecurring: boolean;
    frequencyInDays: number;
    goalIds: string[];
};

type GoalFormData = BaseFormData & {
    type: 'goal';
    targetDate: string;
    taskIds: string[];
};

type FormData = TaskFormData | GoalFormData;

const DEFAULT_FORM_DATA: TaskFormData = {
    userId: 'test-user', // This should come from authentication
    title: '',
    type: 'task',
    status: 'Not Started',
    priority: PRIORITY_MAP['Medium'],
    displayPriority: 'Medium',
    notes: '',
    dueDate: '',
    isRecurring: false,
    frequencyInDays: 0,
    categoryId: '',
    subcategoryId: '',
    goalIds: [],
    completionHistory: []
};

export function AddItemDialog({ open, onOpenChange, onItemAdded }: AddItemDialogProps) {
    const { createItem } = useApp();
    const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createItem(formData);

            // Close dialog and reset form
            onOpenChange(false);
            setFormData(DEFAULT_FORM_DATA);
            onItemAdded?.();
        } catch (error) {
            console.error('Error creating item:', error);
            alert(error instanceof Error ? error.message : 'Failed to create item');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => {
            if (name === 'priority') {
                return {
                    ...prev,
                    priority: PRIORITY_MAP[value as Priority],
                    displayPriority: value as Priority
                };
            }
            if (name === 'type') {
                const newType = value as ItemType;
                if (newType === 'task') {
                    return {
                        ...DEFAULT_FORM_DATA,
                        title: prev.title,
                        notes: prev.notes,
                        priority: prev.priority,
                        displayPriority: prev.displayPriority
                    };
                } else {
                    return {
                        ...prev,
                        type: 'goal',
                        targetDate: '',
                        taskIds: []
                    } as GoalFormData;
                }
            }
            if (name === 'status') {
                return {
                    ...prev,
                    status: value as Status
                };
            }
            return {
                ...prev,
                [name]: type === 'number' ? Number(value) : value
            };
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                        >
                            <option value="task">Task</option>
                            <option value="goal">Goal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            name="priority"
                            value={formData.displayPriority}
                            onChange={handleInputChange}
                            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                        >
                            <option value="Very High">Very High</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                            <option value="Very Low">Very Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <Input
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                        />
                    </div>
                    {formData.type === 'task' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <Input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        isRecurring: e.target.checked
                                    } as TaskFormData))}
                                />
                                <label className="text-sm font-medium">Recurring Task</label>
                            </div>
                            {formData.isRecurring && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Frequency (days)</label>
                                    <Input
                                        type="number"
                                        name="frequencyInDays"
                                        value={formData.frequencyInDays}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {formData.type === 'goal' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Date</label>
                            <Input
                                type="date"
                                name="targetDate"
                                value={formData.targetDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Create Item
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
} 