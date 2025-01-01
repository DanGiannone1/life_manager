# Life Manager Design Document

## Data Model

### Task Document
```typescript
{
    id: string;
    userId: string;
    type: "task" | "goal";
    title: string;
    status: "Not Started" | "Working on it" | "Complete";
    priority: "Very High" | "High" | "Medium" | "Low" | "Very Low";
    notes?: string;
    dueDate?: string; // ISO date string
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    categoryId?: string;
    subcategoryId?: string;
    isRecurring?: boolean;
    frequencyInDays?: number;
    completionHistory?: Array<{
        completedAt: string;
        nextDueDate: string;
    }>;
}
```

### Goal Document
Extends the Task document with additional fields:
```typescript
{
    // ... all Task fields ...
    targetDate?: string; // ISO date string
    milestones?: Array<{
        id: string;
        title: string;
        status: "Not Started" | "Working on it" | "Complete";
        dueDate?: string;
    }>;
}
```

### Category Document
```typescript
{
    id: string;
    userId: string;
    name: string;
    color?: string;
    subcategories?: Array<{
        id: string;
        name: string;
    }>;
}
```

## UI Constants

### Priority Colors
```css
Very High: #E84B3C
High: #F5B800
Medium: #808080
Low: #00DE94
Very Low: #B0B0B0
```

### Status Colors
```css
Not Started: #808080
Working on it: #F5B800
Complete: #00DE94
```

## API Endpoints

### GET /api/get-master-list
Retrieves the master list of items with optional filtering and sorting.

Query Parameters:
- `statuses`: Comma-separated list of status values to filter by
- `sortBy`: Field to sort by (priority, dueDate, createdAt)
- `sortDirection`: Sort direction (asc, desc)
- `type`: Filter by item type (task, goal)

### PATCH /api/batch-update
Updates multiple items in a single request.

Request Body:
```typescript
{
    updates: Array<{
        id: string;
        [field: string]: any;
    }>;
}
```

### POST /api/items
Creates a new item.

Request Body: Task or Goal document (without id, createdAt, updatedAt)