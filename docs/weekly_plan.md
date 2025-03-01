# Weekly Plan Page Documentation

## Overview
The Weekly Plan Page provides a 7-day calendar-style interface for scheduling and managing tasks. It leverages the same core Task model and optimistic Redux architecture used in the rest of the application. Users can see at a glance which tasks are planned for each day of the week, drag unscheduled tasks onto specific days, and toggle task statuses directly within the weekly view.

## Core Concepts

### Single Source of Truth in Redux
- All tasks are stored in Redux (via the tasks slice)
- The Weekly Plan uses scheduledDate on each Task to determine whether it appears on a certain day (e.g., if scheduledDate === "2025-04-05", it shows up on April 5)

### Optimistic Updates & Debounced Sync
- When a user drags a task to a day, the UI immediately sets scheduledDate in Redux
- A background sync call (syncChanges('drag', ...)) persists the change to the backend
- If the user reloads or navigates away, the updated scheduledDate ensures the task reappears on that date

### Same Status-Toggling Logic as Master List
- Tasks can be marked notStarted → workingOnIt → complete using a simple click cycle
- If a recurring task is marked complete, the same recurrence reset logic triggers. The difference is purely visual: the Weekly Plan fades out the completed task after the "green check" animation (and possibly resets dueDate or scheduledDate if it's recurring)

## Goals & Requirements

### Visual Scheduling
- Display a seven-day grid representing the selected week
- Let users drag tasks from an "Unscheduled" list (or from one day to another) to set or change scheduledDate

### Status Management
- Provide the same toggle logic used in the Master List: a click cycles from notStarted to workingOnIt to complete
- Trigger the same optimistic updates and toast notifications, with an additional fade-out animation on completion

### No Extra API Calls for Navigation
- The Weekly Plan only depends on data already fetched and stored in Redux via /api/v1/user-data
- Navigating to previous or next week adjusts which scheduledDate range is displayed, but no new data fetch is required

### Minimal Error Handling
- If a sync call fails, the top panel's sync indicator shows "sync error," but we do not implement automatic reverts or advanced retry logic

## Page Layout

```
+----------------------------------------------------------------------------------+
|  [Weekly Plan Header]  (e.g. "Mar 31, 2025 - Apr 6, 2025")   [Prev | Next]       |
+-----------------------------+----------------------------------------------------+
| Unscheduled Tasks (sidebar) |   7-Day Grid (Mon | Tue | Wed | Thu | Fri | Sat | Sun)
|  - tasks without            |     Each day: tasks with scheduledDate == that day
|    scheduledDate            |     Drag-and-drop to change day or to/from sidebar
+-----------------------------+----------------------------------------------------+
```

### Unscheduled Tasks
- Tasks with no scheduledDate (null/undefined) appear here
- Support drag from this list onto any day column in the grid
- On drop, Redux updates the task's scheduledDate, followed by an automatic background sync (changeType: 'drag')

### 7-Day Grid
- Each column corresponds to a date within the selected week
- Tasks for that date appear in a vertical list (a "day column")
- Dragging a task from one day to another updates its scheduledDate

### Weekly Plan Header
- Shows the currently selected week range
- "Prev" and "Next" buttons adjust a local or Redux-based selectedWeek state
- Since all tasks live in Redux, changing weeks is just a matter of filtering tasks by date

## Key Interactions

### Scheduling a Task
1. Drag a task from the Unscheduled list onto a day's column
2. The app immediately sets task.scheduledDate = <that day> in Redux
3. syncChanges('drag', ...) is called to push the update to the backend

### Rescheduling Between Days
- Drag a task from one day column to another
- Same Redux update + background sync pattern

### Status Toggle
- Click on the task's status bubble or button to cycle: notStarted → workingOnIt → complete
- If complete, handle the same recurring reset logic as on the Master List (e.g., add an entry to completionHistory, set status back to notStarted, etc.), plus a fade-out animation in the Weekly Plan's UI

### Animations & Toast
- On complete, show a brief checkmark toast (and possibly a separate fade-out if you're removing the task from the day column)
- If recurring, also reset the task's scheduledDate or dueDate in Redux, and dispatch a sync
- If non-recurring, leave the task's scheduledDate but show it as complete

## Implementation Details

### Data Model: Task

```typescript
interface Task {
  id: string;
  userId: string;
  type: 'task';
  title: string;
  status: 'notStarted' | 'workingOnIt' | 'complete';
  priority: number;
  dynamicPriority: number;
  effort?: number;
  notes?: string;
  dueDate?: string;
  scheduledDate?: string; // <-- used extensively on Weekly Plan
  createdAt: string;
  updatedAt: string;
  completionHistory: CompletionEntry[];
  recurrence?: {
    isRecurring: boolean;
    rule?: RecurrenceRule;
  };
  tags?: string[];
}
```

**Key Field**: `scheduledDate` determines whether a task appears in a given day column or in the Unscheduled list (null/undefined means unscheduled).

### Redux Integration

#### Selectors
- `selectUnscheduledTasks`: filters tasks where scheduledDate is null/undefined
- `selectTasksForDate(dateString)`: filters tasks whose scheduledDate matches the day

#### Actions & Slices
- The same taskSlice from the Master List handles creation, updates, and deletions
- Setting scheduledDate is handled by a standard updateTask action:

```typescript
store.dispatch(updateTask({ id: task.id, changes: { scheduledDate: '2025-04-05' } }));
```

The syncEngine.ts handles the debounced calls (syncChanges('drag', ...), syncChanges('status', ...), etc.).

### Components

#### WeeklyPlanPage.tsx
- High-Level Container: Renders a WeeklyPlanHeader, an UnscheduledTasksSidebar, and a WeeklyCalendar
- Maintains or retrieves selectedWeek from Redux or local state

#### WeeklyPlanHeader
- Displays the currently selected week range
- Buttons for "previous"/"next" week adjust selectedWeek
- Possibly highlights the current week or day

#### UnscheduledTasksSidebar
- Lists tasks where scheduledDate is not set
- Each task is shown as a small card or row (similar to the Master List's TaskCard) with drag handles
- Initiates a drag event that references the task's ID, letting you drop it onto a day

#### WeeklyCalendar
- A 7-day row (or column) of DayColumn components (e.g., [Mon, Tue, Wed, Thu, Fri, Sat, Sun])
- Each DayColumn uses selectTasksForDate to render relevant tasks
- Each day's tasks are also draggable. You can drag from one day to another. On drop, scheduledDate changes

#### DayColumn
- Accepts a date prop (e.g., '2025-04-05')
- Renders each Task in a stack or list
- Dropping tasks triggers updateTask({ scheduledDate: date })

#### TaskCard (or "TaskRow")
- Reused or adapted from your Master List
- Has the same status toggle logic
- Possibly has an additional fade-out animation on complete if you want to remove completed tasks from the view

## Example Workflow

### User Drags Unscheduled Task
1. The "Unscheduled" sidebar has a task with scheduledDate = undefined
2. The user drags it onto Wednesday (e.g., "2025-04-02")
3. Redux immediately updates task.scheduledDate = '2025-04-02', UI re-renders to show the task under Wednesday
4. syncChanges('drag', [ { type: 'task', operation: 'update', id: task.id, data: { scheduledDate: '2025-04-02' } } ]) is dispatched

### User Marks Task Complete
1. The user clicks on the task's status bubble
2. It cycles from workingOnIt to complete
3. The system shows a green check toast
4. If the task is recurring, a short delay triggers reset logic (e.g., sets status to notStarted, calculates next dueDate, clears scheduledDate, and logs the completion). The UI animates a fade-out from the calendar
5. Another sync call updates the server with these changes

## Future Enhancements

### Drag Reversion / Retry
- Currently not implemented. If a sync call fails, the user sees an error indicator, but no automatic revert occurs

### Filter or Group by Priority
- The Weekly Plan could optionally show higher-priority tasks in a highlight color or separate group

### Extended Recurrence Logic
- You may choose to auto-set the scheduledDate for upcoming occurrences if a task is recurring. Currently, only the completion logic is handled

### Inline Edits
- Let users rename tasks or change notes directly from the weekly calendar, reusing your existing syncChanges('text', ...) approach

## Summary
- The Weekly Plan Page is a specialized interface built atop the same Task model and Redux slices used by the Master List
- Scheduled tasks appear in date columns; unscheduled tasks appear in a sidebar
- Dragging updates scheduledDate, and status toggling uses the same cycle logic from your Master List, with an added fade-out animation for completed tasks
- All changes are optimistic, with a debounced sync operation to persist data in the backend
- Advanced failure recovery (revert/retry) is intentionally out of scope for now, but the page still conforms to the core design patterns of your app (Redux, single container in CosmosDB, and consistent case conversions on the backend)