# Life Manager - Product Requirements Document

## Overview
Life Manager is a personal productivity application designed to help users manage their tasks and goals effectively. The application provides a structured way to handle both recurring and one-time tasks with a clean, modern interface.

## Technical Architecture

### Frontend Stack
- **Framework**: React with Next.js
- **Styling**: TailwindCSS
- **UI Components**: Shadcn Components Library
- **Icons**: Lucide Icons
- **State Management**: React Context API for global state


### Backend Stack
- **Framework**: Python Flask
- **API Design**: RESTful API endpoints


### Database
- **Main Database**: Azure CosmosDB


## Project Structure

frontend/
├── public/
│   ├── icons/
│   │   ├── favicon.ico
│   │   └── site.webmanifest
│   ├── images/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   └── window.svg
│   └── branding/
│       ├── next.svg
│       └── vercel.svg
│
├── src/
│   ├── app/
│   │   ├── home/
│   │   │   └── page.tsx
│   │   ├── master-list/
│   │   │   └── page.tsx
│   │   ├── weekly-plan/
│   │   │   └── page.tsx
│   │   ├── sidebar/
│   │   │   └── sidebar.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   
│   │       
│   │
│   ├── contexts/
│   │   
│   │
│   └── lib/
│       └── utils.ts
│
├── .gitignore
├── .next/
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json


## Core Features

### 1. Navigation
- Responsive sidebar for navigation between different sections
- Collapsible sidebar for mobile responsiveness
- Quick navigation shortcuts

### 2. Dashboard (Main Page)
- Overview of upcoming tasks
- Quick stats and metrics
- Recent activity feed
- Quick-add task button


### 3. Weekly Plan
- View of the week 
- Each Sunday, a weekly plan is generated from the master item list. The user can add, edit, delete, and move things around from the master item list. For now, there is no auto-generation of the weekly plan. User can add from the master list via a drag and drop.

### 4. Master List 
- View of all Items 
- Add/edit/delete Items

## 1. Backend Data Models (CosmosDB)

All documents in CosmosDB use `userId` as the partition key for efficient querying and data organization.

### 1.1 Task Document
```typescript
{
    id: string;                   // UUID
    userId: string;               // Partition key
    type: "task";                 // Document type discriminator
    title: string;
    categoryId: string;
    subcategoryId?: string;
    userPriority: number;         // 1-10
    dynamicPriority: number;      // Calculated field
    status: "not_started" | "in_progress" | "complete";
    notes?: string;
    createdAt: string;            // ISO timestamp
    updatedAt: string;            // ISO timestamp
    focusAreaId?: string;         // Optional reference to parent focus area
    isRecurring: boolean;
    frequencyInDays?: number;     // Required if isRecurring = true
    dueDate?: string;             // ISO timestamp
    completionHistory: {
        completedAt: string;      // ISO timestamp
        nextDueDate: string;      // ISO timestamp
    }[];
}
```

### 1.2 Focus Area Document
```typescript
{
    id: string;                   // UUID
    userId: string;               // Partition key
    type: "focus_area";           // Document type discriminator
    title: string;
    categoryId: string;
    subcategoryId?: string;
    userPriority: number;         // 1-10
    dynamicPriority: number;      // Calculated field
    status: "not_started" | "in_progress" | "complete";
    notes?: string;
    createdAt: string;            // ISO timestamp
    updatedAt: string;            // ISO timestamp
    description: string;
    associatedTaskIds: string[];  // Array of task IDs
}
```

### 1.3 Category Document
```typescript
{
    id: string;                   // UUID
    userId: string;               // Partition key
    type: "category";             // Document type discriminator
    name: string;
    isDefault: boolean;
    subcategories: {
        id: string;               // UUID
        name: string;
    }[];
    createdAt: string;           // ISO timestamp
    updatedAt: string;           // ISO timestamp
}
```

### 1.4 Weekly Plan Document
```typescript
{
    id: string;                  // UUID
    userId: string;              // Partition key
    type: "weekly_plan";         // Document type discriminator
    weekStartDate: string;       // ISO timestamp
    weekEndDate: string;         // ISO timestamp
    items: {
        itemId: string;          // Reference to Task/Focus Area
        originalDueDate?: string;// ISO timestamp
        adjustedDueDate?: string;// ISO timestamp
        completed: boolean;
    }[];
    createdAt: string;          // ISO timestamp
    updatedAt: string;          // ISO timestamp
}
```

## 2. Frontend Data Models

Frontend models transform the backend data for application use, converting ISO strings to Date objects and including additional UI-specific fields.

### 2.1 Core Data Models

#### Base Item Interface
```typescript
interface BaseItem {
    id: string;
    userId: string;
    type: "task" | "focus_area";
    title: string;
    categoryId: string;
    subcategoryId?: string;
    userPriority: number;
    dynamicPriority: number;
    status: ItemStatus;
    notes?: string;
    createdAt: Date;             // Note: Date object, not string
    updatedAt: Date;             // Note: Date object, not string
}
```

#### Task Interface
```typescript
interface Task extends BaseItem {
    type: "task";
    focusAreaId?: string;
    isRecurring: boolean;
    frequencyInDays?: number;
    dueDate?: Date;              // Note: Date object, not string
    completionHistory: {
        completedAt: Date;       // Note: Date object, not string
        nextDueDate: Date;       // Note: Date object, not string
    }[];
}
```

#### Focus Area Interface
```typescript
interface FocusArea extends BaseItem {
    type: "focus_area";
    description: string;
    associatedTaskIds: string[];
}
```

#### Category Interface
```typescript
interface Category {
    id: string;
    userId: string;
    name: string;
    isDefault: boolean;
    subcategories: {
        id: string;
        name: string;
    }[];
    createdAt: Date;            // Note: Date object, not string
    updatedAt: Date;            // Note: Date object, not string
}
```

### 2.2 View Models

View Models are simplified representations of data specifically for UI components.

#### Item List View Model
```typescript
interface ItemListViewModel {
    id: string;
    title: string;
    type: "task" | "focus_area";
    category: string;           // Category name (not ID)
    subcategory?: string;       // Subcategory name (not ID)
    priority: number;
    status: ItemStatus;
    dueDate?: Date;
    isRecurring?: boolean;
    isOverdue?: boolean;        // UI-specific computed field
}
```

#### Weekly Plan View Model
```typescript
interface WeeklyPlanViewModel {
    weekStartDate: Date;
    weekEndDate: Date;
    items: {
        id: string;
        title: string;
        type: "task" | "focus_area";
        priority: number;
        originalDueDate?: Date;
        adjustedDueDate?: Date;
        completed: boolean;
        isOverdue: boolean;     // UI-specific computed field
        categoryName: string;    // Resolved category name
    }[];
}
```

### 2.3 State Management

#### App State
```typescript
interface AppState {
    items: {
        tasks: Record<string, Task>;
        focusAreas: Record<string, FocusArea>;
    };
    categories: Record<string, Category>;
    weeklyPlan?: WeeklyPlan;
    ui: {
        loading: boolean;
        error?: string;
        selectedItemId?: string;
        filters: ItemFilters;
    };
}
```

#### Item Filters
```typescript
interface ItemFilters {
    type?: "task" | "focus_area";
    categoryId?: string;
    subcategoryId?: string;
    status?: ItemStatus;
    priority?: number;
    dueDate?: {
        start: Date;
        end: Date;
    };
}
```

## 3. Key Differences Between Backend and Frontend

### 3.1 Date Handling
- Backend: All dates stored as ISO timestamp strings
- Frontend: All dates handled as JavaScript Date objects

### 3.2 References vs. Resolved Values
- Backend: Stores IDs for relationships (categoryId, focusAreaId)
- Frontend View Models: Often contain resolved values (category names instead of IDs)

### 3.3 Computed Fields
- Backend: Stores only base data
- Frontend: Includes computed fields like `isOverdue` for UI purposes

### 3.4 Data Organization
- Backend: Flat document structure optimized for storage
- Frontend: Normalized state with Records for O(1) lookups
- View Models: Denormalized data optimized for specific UI components