# Life Manager Design Document

## 1. Introduction

This document outlines the design for the Life Manager application, including data models, API endpoints, and other key considerations.

## 2. Data Model

### Backend Data Models (Python/CosmosDB)

#### Task Document Schema
```
TaskDocument:
    id: string
    user_id: string
    type: "task" | "goal"
    title: string
    status: "not_started" | "working_on_it" | "complete"
    priority: int # 0-100
    dynamic_priority: int # 0-100
    notes: string, optional
    due_date: string, optional # ISO date string
    created_at: string # ISO date string
    updated_at: string # ISO date string
    category_id: string, optional
    subcategory_id: string, optional
    is_recurring: boolean, optional
    frequency_in_days: number, optional
    completion_history: Array of { completedAt: string, nextDueDate: string }, optional
}
```

#### Goal Document Schema
```
GoalDocument: extends TaskDocument
    target_date: string, optional # ISO date string
    milestones: Array of { id: string, title: string, status: "not_started" | "working_on_it" | "complete", dueDate: string, optional }, optional
}
```
    
    
    
#### Category Document Schema
```
CategoryDocument:
    id: string;
    user_id: string;
    name: string;
    color: string, optional
    subcategories: Array of { id: string, name: string }, optional
}
```

### Frontend Data Models

#### Task Item
```typescript
interface TaskItem {
    id: string; 
    userId: string; 
    type: "task" | "goal";
    title: string;
    status: "Not Started" | "Working on it" | "Complete";
    priority: "Very High" | "High" | "Medium" | "Low" | "Very Low";
    notes?: string;
    due_date?: string; // Formatted date string 
    created_at: string; // Formatted date string 
    updated_at: string; // Formatted date string 
    categoryId?: string;
    subcategoryId?: string;
    isRecurring?: boolean;
    frequencyInDays?: number;
    completionHistory?: Array<{ 
        completedAt: string; // Formatted date string
        nextDueDate: string; // Formatted date string
    }>;
}
```

#### Goal Item
```typescript
interface GoalItem extends TaskItem { 
    targetDate?: string; // Formatted date string 
    milestones?: Array<{
        id: string; 
        title: string;
        status: "Not Started" | "Working on it" | "Complete";
        dueDate?: string; // Formatted date string
    }>;
}
```
    

#### Category Item
```typescript
interface CategoryItem { 
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

### Mapping Functions

The following functions will be used to map between backend and frontend data models:

*   `mapTaskDocumentToTaskItem` (handles `snake_case` to `camelCase`, status and priority conversions)
*   `mapGoalDocumentToGoalItem` (handles `snake_case` to `camelCase`, status and priority conversions)
*   `mapCategoryDocumentToCategoryItem` (handles `snake_case` to `camelCase`)

These functions will handle data transformations, formatting, and any other necessary conversions.

### Data Transfer Contract

The data models defined above, along with the mapping functions, form the contract between the frontend and backend. Any changes to these models or functions should be carefully considered and communicated between teams.
    
    

## 3. UI Constants

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
    

## 4. API Endpoints

### GET /api/get-master-list
Retrieves the master list of items with optional filtering and sorting.

Query Parameters:
- `statuses`: Comma-separated list of status values to filter by
- `sortBy`: Field to sort by (priority, dueDate, createdAt)
- `sortDirection`: Sort direction (asc, desc)
- `type`: Filter by item type (task, goal)

### GET /api/items/{id}
Retrieves a single item by its ID.

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
    
A maximum of 100 items can be updated in a single batch request. If one update in the batch fails, the entire batch will be rolled back.

### POST /api/items
Creates a new item.

Request Body: Task or Goal document (without id, createdAt, updatedAt)

### DELETE /api/items/{id}
Deletes a single item by its ID.

### POST /api/categories
Creates a new category.

### GET /api/categories
Retrieves all categories.

### GET /api/categories/{id}
Retrieves a single category by its ID.

### PATCH /api/categories/{id}
Updates a category.

### DELETE /api/categories/{id}
Deletes a category.

## 5. Error Handling

API endpoints will return appropriate HTTP status codes (e.g., 400 for bad requests, 404 for not found, 500 for server errors). Error responses will be in JSON format with an error message.

## 6. Authentication and Authorization

Authentication will be handled using JWT (JSON Web Tokens). Authorization will be based on user roles and permissions.

## 7. Filtering and Sorting

Filters are applied using exact matches for status and type. Sorting is done based on the selected field and direction.

## 8. Recurring Tasks

When a recurring task is completed, a new instance of the task is created with a new due date based on the `frequencyInDays`. The `completionHistory` is updated with the completion date and the next due date.

## 9. Milestones

There is no limit on the number of milestones for a goal. Milestones have the same status values as tasks and goals.

## 10. Other Considerations

*   The `updatedAt` field is automatically updated on every change to the document.
*   IDs are generated using UUIDs (version 4).
*   Batch update limits and behavior
