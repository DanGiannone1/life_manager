# Task Plan

1. Backend ✓
   - [x] Validate that app.py adheres to the design document and everything is implemented correctly

2. Frontend Setup ✓
   - [x] Create a React Vite app with TypeScript named 'frontend'
   - [x] Install packages necessary to adhere to design doc
   - [x] Set up initial configuration (TypeScript, Tailwind, shadcn/ui)
   - [x] Create scaffolding for the frontend:
       [x] Set up Redux store structure (tasks and sync slices)
       [x] Set up API client and sync engine
       [x] Create base layout components:
           [x] Sidebar component with navigation
           [x] Top panel with sync status

3. Core Pages 
   - [ ] HomePage.tsx (scaffolded)
   - [ ] WeeklyPlanPage.tsx  (scaffolded)
   - [x] MasterListPage.tsx (implemented with TaskTable)

4. Task Components ✓
   - [x] TaskTable.tsx (complete with sorting and display)
   - [x] TaskTableRow.tsx (complete with actions and status updates)
   - [x] TaskDetails.tsx (dialog for viewing task details)
   - [x] TaskCard.tsx (basic structure)


5. Add Task Creation Flow
   - [ ] Create AddTaskDialog Component
       - [ ] Create basic dialog structure using shadcn Dialog
       - [ ] Add form fields for required task properties:
           - [ ] Title (required)
           - [ ] Priority (optional)
           - [ ] Effort (optional)
           - [ ] Due Date (optional)
           - [ ] Notes (optional)
       - [ ] Add form fields for recurrence:
           - [ ] Is Recurring checkbox
           - [ ] Frequency select (daily, weekly, monthly, yearly)
           - [ ] Interval input
           - [ ] Additional fields based on frequency

   
   - [ ] Implement Task Creation in Redux
       - [ ] Add createTask action to taskSlice
       - [ ] Update syncEngine to handle task creation
       - [ ] Ensure task creation adheres to core design strategy of optimistic updates, immediate feedback, and debouncing syncs to the backend via syncEngine

   - [ ] Add Task Creation Button
       - [ ] Add action button in MasterListPage


6. Task Recurrence Logic
   - [ ] Update Task Completion Flow
       - [ ] Create utility function to calculate next due date based on recurrence rule
       - [ ] Add completion record to history when marking complete
       - [ ] Add logic to reset recurring tasks:
           - [ ] Status back to notStarted
           - [ ] Update due date based on recurrence rule

   
   - [ ] Add Recurrence Preview
       - [ ] Show next occurrence date in TaskDetails
       - [ ] Add visual indicator for recurring tasks in table
       - [ ] Add tooltip showing recurrence pattern


1. Add "Add Task" functionality
    -  Create AddTaskDialog component
    -  Implement task creation flow in Redux
    -  Add create task API integration (/sync)
    -  Validate task creation flow adheres to core design strategy

2. Core Functionality 
    - Add recurrence logic -> when a task with a recurrence is marked complete, reset the status to not started and update the due date based on the recurrence. Add a record of the completion to the completion_history field. 
    - Add the ability to edit task details (Due Date, Notes, Title) 

3. Create collapsable filter and sort scaffolding 