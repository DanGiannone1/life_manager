import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterOptions {
    statuses: ('Not Started' | 'Working On It' | 'Complete')[];
    sortBy: 'priority' | 'dueDate' | 'createdAt';
    sortDirection: 'asc' | 'desc';
    type?: 'all' | 'task' | 'goal';
}

interface ItemFiltersProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
}

export function ItemFilters({ filters, onFiltersChange }: ItemFiltersProps) {
    const toggleStatus = (status: FilterOptions['statuses'][0]) => {
        const newStatuses = filters.statuses.includes(status)
            ? filters.statuses.filter(s => s !== status)
            : [...filters.statuses, status];
        onFiltersChange({ ...filters, statuses: newStatuses });
    };

    return (
        <div className="filter-panel">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700">Status</Label>
                    <div className="space-y-4 pt-1">
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="not_started"
                                checked={filters.statuses.includes('Not Started')}
                                onCheckedChange={() => toggleStatus('Not Started')}
                                className="border-gray-200 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                            />
                            <label 
                                htmlFor="not_started"
                                className="text-sm font-medium text-gray-700"
                            >
                                Not Started
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="working_on_it"
                                checked={filters.statuses.includes('Working On It')}
                                onCheckedChange={() => toggleStatus('Working On It')}
                                className="border-gray-200 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                            />
                            <label 
                                htmlFor="working_on_it"
                                className="text-sm font-medium text-gray-700"
                            >
                                Working On It
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="complete"
                                checked={filters.statuses.includes('Complete')}
                                onCheckedChange={() => toggleStatus('Complete')}
                                className="border-gray-200 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                            />
                            <label 
                                htmlFor="complete"
                                className="text-sm font-medium text-gray-700"
                            >
                                Complete
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700">Sort By</Label>
                    <Select
                        value={filters.sortBy}
                        onValueChange={(value: FilterOptions['sortBy']) =>
                            onFiltersChange({ ...filters, sortBy: value })
                        }
                    >
                        <SelectTrigger className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="priority" className="text-gray-700 hover:bg-gray-50">Priority</SelectItem>
                            <SelectItem value="dueDate" className="text-gray-700 hover:bg-gray-50">Due Date</SelectItem>
                            <SelectItem value="createdAt" className="text-gray-700 hover:bg-gray-50">Created Date</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700">Sort Direction</Label>
                    <Select
                        value={filters.sortDirection}
                        onValueChange={(value: FilterOptions['sortDirection']) =>
                            onFiltersChange({ ...filters, sortDirection: value })
                        }
                    >
                        <SelectTrigger className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                            <SelectValue placeholder="Sort direction..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="asc" className="text-gray-700 hover:bg-gray-50">Ascending</SelectItem>
                            <SelectItem value="desc" className="text-gray-700 hover:bg-gray-50">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700">Type</Label>
                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(value: NonNullable<FilterOptions['type']>) =>
                            onFiltersChange({ ...filters, type: value === 'all' ? undefined : value })
                        }
                    >
                        <SelectTrigger className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                            <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="all" className="text-gray-700 hover:bg-gray-50">All Types</SelectItem>
                            <SelectItem value="task" className="text-gray-700 hover:bg-gray-50">Tasks</SelectItem>
                            <SelectItem value="goal" className="text-gray-700 hover:bg-gray-50">Goals</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
} 