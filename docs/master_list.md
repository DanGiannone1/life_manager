# Master List Page Requirements & Implementation

## Table of Contents
1. [Overview](#overview)
2. [Purpose & Goals](#purpose--goals)
3. [Key Features](#key-features)
    - [Task Table](#task-table)
    - [New Task Creation](#new-task-creation)
    - [Status Updates](#status-updates)
    - [Priority & Effort Updates](#priority--effort-updates)
    - [Task Deletion](#task-deletion)
    - [Task Details Dialog](#task-details-dialog)
4. [Data Flow & Architecture](#data-flow--architecture)
    - [Redux State & Actions](#redux-state--actions)
    - [Sync Operations](#sync-operations)
    - [UI/UX Flow](#uiux-flow)
5. [Relevant Code Files & Interfaces](#relevant-code-files--interfaces)
    - [MasterListPage.tsx](#masterlistpagetsx)
    - [TaskTable.tsx](#tasktabletsx)
    - [TaskTableRow.tsx](#tasktablerowtsx)
    - [AddTaskDialog.tsx](#addtaskdialogtsx)
    - [Task.ts Interface](#taskts-interface)
    - [Sync Engine & Data Models](#sync-engine--data-models)
6. [How It Aligns with the Design Document](#how-it-aligns-with-the-design-document)
7. [Future Enhancements](#future-enhancements)

---

## Overview
The **Master List** page displays all tasks in a tabular, filterable, and sortable layout. It also allows users to create new tasks, update existing tasks (status, priority, effort, etc.), and view additional details in a dialog. This page is intended to be a centralized "all-tasks" view, complementing other domain-specific pages like the Weekly Plan.

In the UI screenshot, each row of the table shows a single task's essential information (title, status, priority, effort, due date, etc.). A user can also create new tasks via the **New Task** button at the top right.

---

## Purpose & Goals
- **Easy Visibility**: Provide a single page for users to see all their tasks in a list/table format.
- **Quick Interaction**: Change statuses, priorities, or effort with minimal clicks.
- **New Task Creation**: Let users add tasks without leaving the page.
- **Detailed Inspection**: Access more info in a pop-up dialog (history, recurrence info, notes).
- **Backend Sync**: Changes appear instantly in the UI (optimistic updates) and automatically sync with the backend via the shared sync engine.

---

## Key Features

### Task Table
- Renders a table of tasks, one per row.
- Each column includes properties like **Title**, **Status**, **Priority**, **Effort**, **Due Date**, **Recurrence**, and **Notes**.
- The final **Actions** column provides buttons to **view** task details or **delete** the task.

### New Task Creation
- A **New Task** button is positioned in the top-right corner of the page.
- Clicking it opens the `AddTaskDialog`, a modal form that collects:
  - **Title** (required)
  - **Priority** (defaults to Medium / 40)
  - **Effort** (defaults to Medium / 3)
  - **Due Date** (optional date selector)
  - **Notes** (optional text)
  - **Recurrence** (optional, with fields for frequency and interval)
- Form validations ensure a title is entered and recurrence intervals make sense.

### Status Updates
- Clicking the **status bubble** in each row cycles the task through `Not Started`, `Working on It`, and `Complete`. 
- If the task is recurring, setting it to `complete` triggers logic to reset it:
  1. Marks it complete momentarily.
  2. Creates a completion record in `completionHistory`.
  3. Immediately resets status to `not_started`, updates `due_date` based on the recurrence rule, and logs a toast notification.
- The user sees an animation while the task transitions.

### Priority & Effort Updates
- **Priority**: Each row includes a priority chip. Clicking it cycles through `Very Low (0)`, `Low (20)`, `Medium (40)`, `High (60)`, `Very High (80)`.
- **Effort**: A similar chip cycles from `Very Low (1)` to `Very High (5)`.

### Task Deletion
- Each row has a trash icon button. Clicking it pops open a small **Popover** to confirm deletion. If confirmed, the task is optimistically removed from Redux and marked for deletion in the backend sync engine.

### Task Details Dialog
- Clicking the eye icon opens the `TaskDetails` dialog, which shows:
  - Status and color-coded bubble
  - Priority (numeric plus color-coded chip)
  - Due Date (read-only display)
  - Scheduled Date (read-only display)
  - Recurrence summary (if any)
  - Completion History (timestamps and optional completion notes)
- This dialog is read-only by default but helps the user quickly reference deeper details.

---

## Data Flow & Architecture

### Redux State & Actions
1. **`taskSlice`**  
   - Stores tasks in normalized form (`items: Record<id, Task>`).
   - Includes actions: `addTask`, `updateTask`, `deleteTask`, `setTasks` (bulk set).
   
2. **`syncSlice`**  
   - Stores the global sync state: `status: 'idle' | 'syncing' | 'error'`, plus `lastSynced` timestamp.
   - Actions like `setSyncStatus`, `setLastSynced` keep track of sync progress.

### Sync Operations
- **Optimistic Updates**: Whenever the user changes a task (status, priority, etc.), the UI updates immediately.
- **Debounced Sync**: The system schedules a sync request to the `/api/v1/sync` endpoint after a brief delay. Each type of change (e.g. status vs. text) has a different debounce time.
- The server's response may contain newer changes from other clients or server-side logic, which get merged back into local state.

### UI/UX Flow
1. **Load**: When the user navigates to the Master List page, the tasks are already loaded into Redux from an initial fetch at app startup.
2. **Interaction**: 
   - User sees a table of tasks.  
   - User can click status, priority, or effort chips to cycle through values; a sync operation is scheduled automatically.  
   - Deletion or creation triggers an immediate store update plus a background sync.  
   - If recurring tasks are completed, the system initiates a small animation, updates the store, and triggers a re-sync.

---

## Relevant Code Files & Interfaces

### `MasterListPage.tsx`
- **Location**: `frontend/src/pages/MasterListPage.tsx`
- **Responsibilities**:
  - Fetches tasks from Redux and converts to array (`tasksArray`).
  - Renders the **New Task** button, which opens `AddTaskDialog`.
  - Displays `TaskTable` with all tasks.

### `TaskTable.tsx`
- **Location**: `frontend/src/components/task/TaskTable.tsx`
- **Responsibilities**:
  - Receives an array of tasks.
  - Renders them in a `<table>` structure using shadcn/ui `Table` components.
  - Maps each task to a `TaskTableRow`.

### `TaskTableRow.tsx`
- **Location**: `frontend/src/components/task/TaskTableRow.tsx`
- **Responsibilities**:
  - Renders each task's columns (title, status, priority, etc.).
  - Implements click handlers to cycle statuses, priority, effort.
  - Initiates sync calls via `syncChanges(...)`.
  - Opens the `TaskDetails` dialog or the delete confirmation popover.

### `AddTaskDialog.tsx`
- **Location**: `frontend/src/components/task/AddTaskDialog.tsx`
- **Responsibilities**:
  - Renders a form in a dialog for creating new tasks:
    - Title, Priority, Effort, Due Date, Notes, Recurrence, etc.
  - Validates user input (e.g., Title is required).
  - Dispatches `addTask` to Redux plus a "create" operation to the sync engine.
  - Closes on successful creation.

### `Task.ts` Interface
- **Location**: `frontend/src/utils/types.ts`
- **Interface Definition**:
  ```typescript
  export interface Task {
    id: UUID;
    userId: UUID;
    type: 'task';
    title: string;
    status: 'notStarted' | 'workingOnIt' | 'complete';
    priority: number;
    dynamicPriority: number;
    effort?: number;
    notes?: string;
    dueDate?: string;
    scheduledDate?: string;
    createdAt: string;
    updatedAt: string;
    completionHistory: CompletionEntry[];
    recurrence?: { isRecurring: boolean; rule?: RecurrenceRule };
    tags?: string[];
  }
  ```
- The status field is used heavily on this page (cycling from `notStarted` → `workingOnIt` → `complete`).
- The optional recurrence object leads to automatic re-scheduling logic when a task is completed.

### Sync Engine & Data Models
- `syncEngine.ts` manages debounced sync calls.
- `api.ts` provides methods for fetching user data (`getUserData`) and syncing changes (`sync`).
- Backend: Follows the design document's architecture, using a single container in Cosmos DB with snake_case fields.
- Case conversions happen on the backend so the frontend can remain in camelCase.

---

## How It Aligns with the Design Document
- **Single Source of Truth**: Uses Redux for local state; aligns with "Data Flow & Sync Strategy" from the design doc.
- **Optimistic Updates**: Immediately applies UI changes, then syncs in the background.
- **Enum & Value Mappings**: Follows the design doc's approach for statuses, priority ranges, effort levels, and recurrence data.
- **Case Conversion**: The backend handles snake_case, while the frontend remains in camelCase per the design doc's instructions.
- **Component Architecture**: Splits table, table row, details dialog, add dialog into separate files, aligning with the doc's "Component Architecture" section for maintainability.

---

## Future Enhancements

### Filtering & Sorting
- Add UI controls to filter tasks by status, due date, or search keywords.
- Integrate table-based or server-based sorting (by priority, effort, or date).

### Inline Editing
- Edit titles or notes directly in the row, further reducing the need for a details dialog.

### Pagination
- For users with very large task sets, a paginated or virtualized table might be necessary.