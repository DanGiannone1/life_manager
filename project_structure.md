# Project Structure

This document outlines the organization of the codebase, grouping files by their primary functionality. Some files are listed in multiple categories if they have cross-cutting responsibilities.

---

## 1. Core Documents & Planning

- **README.md**  
  Contains an overview of the project, tech stack, and initial folder structure.

- **design_document.md**  
  Details architecture, data models, API endpoints, and UI design guidelines.

- **project_structure.md**  
  (This file) Provides a categorized overview of the codebase.

- **task_plan.md**  
  A step-by-step feature/implementation checklist.

- **widgets.md**  
  Specifications for dashboard widgets (e.g., Today’s Tasks, Progress).

---

## 2. Backend (Flask + CosmosDB)

- **backend/app.py**  
  Main Flask application with `/api/v1/user-data` and `/api/v1/sync` routes, global error handling, and rate limiting.

- **backend/cosmos_db.py**  
  `CosmosDBManager` class for CRUD operations against Cosmos DB.

- **backend/requirements.txt**  
  Lists Python dependencies (Flask, azure-cosmos, etc.).

---

## 3. Frontend Entrypoints & Configuration

- **frontend/index.html**  
  Root HTML for the React app.

- **frontend/package.json**  
  Lists JavaScript/TypeScript dependencies and scripts.

- **frontend/vite.config.ts**  
  Vite dev server settings, proxy config for backend, path aliases, etc.

- **frontend/tailwind.config.js**  
  Tailwind configuration (brand colors, utility classes).

- **frontend/postcss.config.js**  
  PostCSS + Autoprefixer setup for Tailwind.

- **frontend/src/main.tsx**  
  Main entry point that renders the React `<App />` and integrates Redux `<Provider>`.

---

## 4. Frontend State Management (Redux)

- **frontend/src/store/index.ts**  
  Initializes Redux store, combines root reducer, exports store types.

- **frontend/src/store/slices/tasksSlice.ts**  
  Manages `Task` data, supports add/update/delete operations.

- **frontend/src/store/slices/goalsSlice.ts**  
  Manages `Goal` data, supports add/update/delete operations.

- **frontend/src/store/slices/categoriesSlice.ts**  
  Manages `Category` data (name, color, etc.).

- **frontend/src/store/slices/dashboardSlice.ts**  
  Stores user’s Dashboard widgets, supports widget CRUD.

- **frontend/src/store/slices/syncSlice.ts**  
  Tracks overall sync status (`idle`, `syncing`, `error`), `lastSynced`, pending changes.

- **frontend/src/store/slices/masterListSlice.ts**  
  Maintains filters and sorting for the Master List (status, category, date range, etc.).

- **frontend/src/store/thunks/syncThunks.ts**  
  Async thunks for fetching user data (`fetchUserDataThunk`) and syncing changes (`syncChangesThunk`) with retry/backoff.

---

## 5. Debouncing & Syncing

- **frontend/src/hooks/useSync.ts**  
  Core hook that initializes `SmartDebounceManager`, handles load/sync actions, and tracks pending changes.

- **frontend/src/utils/SmartDebounceManager.ts**  
  Batches user edits (e.g., title changes, status toggles) and triggers `syncChangesThunk` after a delay.

- **frontend/src/hooks/useDebounce.ts**  
  Generic hook to debounce input values (primarily used for inline text editing).

- **frontend/src/store/thunks/syncThunks.ts**  
  (Referenced again here because it includes sync logic and retry/backoff.)

---

## 6. Frontend Pages & Page-Specific Components

### 6.1 Master List

- **frontend/src/pages/MasterList.tsx**  
  Top-level container for the Master List. Renders filter panel, item table, and “Add Task/Goal” buttons.

- **frontend/src/components/master-list/FilterBar.tsx**  
  Collapsible panel offering search, status/category/priority/date-range filters.

- **frontend/src/components/master-list/ItemTable.tsx**  
  Displays tasks/goals in a virtualized list. Columns for status, priority, dates, etc.

- **frontend/src/components/master-list/StatusCell.tsx**  
  Lets users toggle between `notStarted`, `workingOnIt`, and `complete`. Syncs changes via `useSync`.

- **frontend/src/components/master-list/InlineEdit.tsx**  
  Enables inline editing of text fields for tasks/goals with a debounce.

### 6.2 Weekly Plan (Placeholder)

- **frontend/src/App.tsx**  
  Routes to `<WeeklyPlan />` if implemented. Currently a placeholder.

### 6.3 Home / Dashboard (Placeholder)

- **frontend/src/App.tsx**  
  Renders `<Home />` at `/`.

---

## 7. Shared Layout & Navigation

- **frontend/src/components/layouts/layout.tsx**  
  Wraps main content with a top header (sync indicator, settings, logout) and sidebar navigation (collapsible on mobile).

- **frontend/src/components/layouts/app-layout.tsx**  
  Handles container widths (e.g., `max-w-lg` vs. `max-w-full`) and calls `loadInitialData` on mount.

---

## 8. UI Wrappers & Shared Components

These typically wrap Shadcn UI components or provide minor stylistic/business logic.  
Files like `button.tsx`, `select.tsx`, etc., implement consistent design tokens and minimal functionality.

- **frontend/src/components/wrappers/button.tsx**  
- **frontend/src/components/wrappers/dialog.tsx**  
- **frontend/src/components/wrappers/input.tsx**  
- **frontend/src/components/wrappers/select.tsx**  
- **frontend/src/components/wrappers/tabs.tsx**  
- **frontend/src/components/wrappers/toast.tsx**  
- **frontend/src/components/wrappers/toggle.tsx**  
- **frontend/src/components/wrappers/card.tsx**  
- **frontend/src/components/wrappers/container.tsx**  
- **frontend/src/components/wrappers/date-picker.tsx**  
- **frontend/src/components/wrappers/dropdown-menu.tsx**  
- **frontend/src/components/wrappers/icons.tsx**  

*(Also includes Shadcn-based components in `frontend/src/components/ui/`. These do not contain unique application logic, mainly styling and composition.)*

---

## 9. Miscellaneous Frontend Files

- **frontend/src/components/sync/SyncIndicator.tsx**  
  A small component that displays the global sync status (syncing, error, last synced time).

- **frontend/src/index.css**  
  A basic CSS file for global styles and resets.

- **frontend/src/styles/globals.css**  
  Tailwind’s base/component layers, plus color variables and brand theming.

- **frontend/src/lib/navigation.ts**  
  Defines app routes (`HOME`, `WEEKLY_PLAN`, etc.) and sidebar navigation items.

- **frontend/src/lib/utils.ts**  
  Utility function `cn()` for merging class names and other small helpers.

---

## 10. Types & Services

- **frontend/src/types/**  
  - **index.ts**: Shared TypeScript interfaces (Task, Goal, Category, etc.).  
  - **api.ts**: Defines API request/response interfaces, error codes, etc.

- **frontend/src/services/api.ts**  
  Low-level fetch helpers for `/api/v1/user-data` and `/api/v1/sync` calls, plus retry config.

