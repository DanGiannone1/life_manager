import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onItemAdded?: () => void;
}

export function AddItemDialog({ open, onOpenChange, onItemAdded }: AddItemDialogProps) {
    const [formData, setFormData] = useState({
        title: '',
        type: 'task',
        status: 'Not Started',
        priority: 'Medium',
        notes: '',
        dueDate: '',
        isRecurring: false,
        frequencyInDays: 0,
        categoryId: '',
        subcategoryId: '',
        // Goal-specific fields
        targetDate: '',
        // Task-specific fields
        goalIds: [] as string[],
        // Arrays initialized empty
        completionHistory: [] as Array<{ completedAt: string, nextDueDate: string }>,
        associatedTaskIds: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/create-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userId: 'test-user', // This should come from authentication
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create item');
            }

            const data = await response.json();
            console.log('Item created:', data);
            onOpenChange(false);
            onItemAdded?.();
            
            // Reset form
            setFormData({
                title: '',
                type: 'task',
                status: 'Not Started',
                priority: 'Medium',
                notes: '',
                dueDate: '',
                isRecurring: false,
                frequencyInDays: 0,
                categoryId: '',
                subcategoryId: '',
                targetDate: '',
                goalIds: [],
                completionHistory: [],
                associatedTaskIds: []
            });
            
        } catch (error) {
            console.error('Error creating item:', error);
            alert(error instanceof Error ? error.message : 'Failed to create item');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
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
                            value={formData.priority}
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
                                    }))}
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