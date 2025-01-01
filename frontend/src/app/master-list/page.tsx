'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { AddItemDialog } from "@/components/items/add-item-dialog";
import { ItemFilters, FilterOptions } from "@/components/items/item-filters";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
    SlidersHorizontal, 
    Calendar,
    Save,
    Pencil,
    CheckCircle2,
    AlertCircle,
    CircleDot
} from "lucide-react";

interface Item {
    id: string;
    title: string;
    type: 'task' | 'goal';
    priority: string;
    status: string;
    notes?: string;
    dueDate?: string;
    createdAt: string;
    categoryId?: string;
    subcategoryId?: string;
    isRecurring?: boolean;
    frequencyInDays?: number;
    completionHistory?: Array<{
        completedAt: string;
        nextDueDate: string;
    }>;
}

interface EditableFieldProps {
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'date';
    className?: string;
}

function EditableField({ value, onChange, type = 'text', className }: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleChange = (newValue: string) => {
        setEditValue(newValue);
        onChange(newValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleChange(editValue);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(value);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type={type}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleChange(editValue)}
                onKeyDown={handleKeyDown}
            />
        );
    }

    return (
        <div 
            className="editable-cell"
            onClick={() => setIsEditing(true)}
        >
            <div className={cn("editable-content", className)}>
                {value}
            </div>
            <Pencil className="edit-icon" />
        </div>
    );
}

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'Working on it':
            return 'status-badge working';
        case 'Complete':
            return 'status-badge complete';
        default:
            return 'status-badge not-started';
    }
};

const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
        case 'Very High':
            return 'priority-badge very-high';
        case 'High':
            return 'priority-badge high';
        case 'Medium':
            return 'priority-badge medium';
        case 'Low':
            return 'priority-badge low';
        default:
            return 'priority-badge very-low';
    }
};

function StatusSelect({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={cn(
                "select-trigger-no-border",
                getStatusBadgeClass(value)
            )}>
                <SelectValue>{value}</SelectValue>
            </SelectTrigger>
            <SelectContent className="select-content-rounded">
                <SelectItem value="Not Started" className="select-item-hover">Not Started</SelectItem>
                <SelectItem value="Working on it" className="select-item-hover">Working on it</SelectItem>
                <SelectItem value="Complete" className="select-item-hover">Complete</SelectItem>
            </SelectContent>
        </Select>
    );
}

function PrioritySelect({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    return (
        <Select 
            value={value} 
            onValueChange={onChange}
        >
            <SelectTrigger className={cn(
                "select-trigger-no-border",
                getPriorityBadgeClass(value)
            )}>
                <SelectValue>{value}</SelectValue>
            </SelectTrigger>
            <SelectContent className="select-content-rounded">
                <SelectItem value="Very High" className="select-item-hover">Very High</SelectItem>
                <SelectItem value="High" className="select-item-hover">High</SelectItem>
                <SelectItem value="Medium" className="select-item-hover">Medium</SelectItem>
                <SelectItem value="Low" className="select-item-hover">Low</SelectItem>
                <SelectItem value="Very Low" className="select-item-hover">Very Low</SelectItem>
            </SelectContent>
        </Select>
    );
}

export default function MasterList() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<Item>>>({});
    const [filters, setFilters] = useState<FilterOptions>({
        statuses: ['not_started', 'in_progress'],
        sortBy: 'priority',
        sortDirection: 'asc',
        type: undefined
    });

    const fetchItems = async () => {
        try {
            const queryParams = new URLSearchParams({
                statuses: filters.statuses.join(','),
                sortBy: filters.sortBy,
                sortDirection: filters.sortDirection,
                ...(filters.type && { type: filters.type })
            });

            const response = await fetch(`http://localhost:5000/api/get-master-list?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [filters]);

    const handleUpdateField = (id: string, field: string, value: any) => {
        setPendingChanges(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleSaveChanges = async () => {
        try {
            const updates = Object.entries(pendingChanges).map(([id, changes]) => ({
                id,
                ...changes
            }));

            const response = await fetch(`http://localhost:5000/api/batch-update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ updates }),
            });

            if (!response.ok) {
                throw new Error('Failed to update items');
            }

            // Update local state
            setItems(items.map(item => {
                const changes = pendingChanges[item.id];
                return changes ? { ...item, ...changes } : item;
            }));

            // Clear pending changes
            setPendingChanges({});
        } catch (error) {
            console.error('Error updating items:', error);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-8">
                <h1 className="page-title">Master List</h1>
                <div className="flex items-center gap-2">
                    <Button
                        className="page-header-button"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal className="filter-icon" />
                    </Button>
                    <Button
                        className="save-button"
                        onClick={handleSaveChanges}
                        disabled={!hasPendingChanges}
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                    <Button 
                        onClick={() => setOpen(true)}
                        className="page-header-button"
                    >
                        Add Item
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="mb-6">
                    <ItemFilters 
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </div>
            )}

            <AddItemDialog 
                open={open} 
                onOpenChange={setOpen}
                onItemAdded={fetchItems}
            />

            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            ) : (
                <div className="grid-container">
                    <div className="grid-header">
                        <div className="grid-header-cell">Item</div>
                        <div className="grid-header-cell center">Status</div>
                        <div className="grid-header-cell">Due Date</div>
                        <div className="grid-header-cell">Created On</div>
                        <div className="grid-header-cell">Priority</div>
                    </div>
                    <div className="grid-body">
                        {items.map((item) => {
                            const itemChanges = pendingChanges[item.id] || {};
                            const displayItem = { ...item, ...itemChanges };

                            return (
                                <div key={item.id} className="grid-row">
                                    <div className="grid-cell">
                                        <EditableField
                                            value={displayItem.title}
                                            onChange={(value) => handleUpdateField(item.id, 'title', value)}
                                            className="item-title"
                                        />
                                    </div>
                                    <div className="grid-cell center">
                                        <StatusSelect
                                            value={displayItem.status}
                                            onChange={(value) => handleUpdateField(item.id, 'status', value)}
                                        />
                                    </div>
                                    <div className="grid-cell">
                                        <EditableField
                                            value={displayItem.dueDate || 'N/A'}
                                            onChange={(value) => handleUpdateField(item.id, 'dueDate', value)}
                                            type="date"
                                        />
                                    </div>
                                    <div className="grid-cell">
                                        {formatDate(displayItem.createdAt)}
                                    </div>
                                    <div className="grid-cell">
                                        <PrioritySelect
                                            value={displayItem.priority}
                                            onChange={(value) => handleUpdateField(item.id, 'priority', value)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
} 