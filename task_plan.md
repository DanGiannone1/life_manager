1. Implement the Backend Fundamentals (Flask + CosmosDB)
   - Initialize Flask
     - Set up a minimal Flask app (app.py or wsgi.py) with placeholder endpoints.
     - Confirm that you can run the Flask server locally.
   - Connect to CosmosDB
     - Install and configure the Python SDK for CosmosDB.
     - Implement a small wrapper/service class for CosmosDB interactions (e.g., create, read, update, delete documents).
   - Partition & Indexing Strategy
     - Configure your CosmosDB container with the partition key and indexing policy you outlined (user_id partition, indexes on type, updated_at, etc.).
     - Test basic queries:
       ```python
       SELECT * FROM c WHERE c.user_id = '<TEST_USER>'
       ```
   - Authentication & JWT Setup
     - Implement a basic JWT auth flow (endpoints for login, token generation, token validation).
     - Protect your core endpoints with a decorator/middleware that checks the Authorization header.

   **Why**: You need a working backend to store and retrieve data before you can effectively test the frontend's Redux integration and sync logic.

2. Set Up Core API Endpoints
   - GET /api/v1/user-data
     - Implement the bulk data fetch endpoint (tasks, goals, categories, dashboard) for a given user.
     - Return the data in the ApiResponse<T> format you described.
   - POST /api/v1/sync
     - Implement the endpoint for receiving batched changes (create, update, delete).
     - Include logic to handle concurrency or merges if needed.
     - Return any serverChanges if the backend has more recent data.
   - Error Handling & Response Consistency
     - Ensure standard error codes (400, 401, 403, etc.) and the ApiResponse format are used.
     - Implement a global error handler in Flask to wrap errors in your consistent JSON structure.
   - Rate Limiting
     - Configure rate limiting (e.g., Flask-Limiter) for the endpoints as described.
     - Return the appropriate headers (X-RateLimit-*) and error response when limit is exceeded.

   **Why**: These endpoints are crucial for loading initial data and syncing client-side changes.

3. Initialize the Frontend (React, NextJS, Tailwind, Shadcn UI)
   - Project Scaffolding
     - Generate a NextJS project within the /frontend folder.
     - Integrate TailwindCSS.
     - Install Shadcn/UI or replicate a similar approach.
   - Configure Redux Toolkit
     - Set up your root reducer in store.ts with slices for tasks, goals, categories, dashboard, sync, etc.
     - Add middleware for handling async actions and debounced sync logic.
   - Global Layout Setup
     - Create a <Layout> or _app.tsx that wraps all pages.
     - Confirm navigation between placeholder pages works.

   **Why**: You now have the skeleton for your frontend, with the essential technology stack integrated.

4. Implement the Sync Flow (Frontend + Backend Integration)
   - Redux Thunks or RTK Query
     - Implement fetchUserData thunk for GET /api/v1/user-data
     - Implement syncChanges thunk for POST /api/v1/sync
   - Initial Load Flow
     - On app start, dispatch fetchUserData() to populate the store.
     - Show loading states appropriately.
   - Optimistic Updates & Debouncing
     - Implement SmartDebounceManager.
     - Handle immediate Redux updates with queued syncs.
     - Track pendingChanges in the sync slice.
   - Sync Indicator
     - Display sync status in Top Panel.
     - Show last synced time or error states.

   **Why**: This ensures frontend and backend can communicate in real-time.

5. Build the Global UI Layout (Sidebar, Top Panel)
   - Sidebar Implementation
     - Create <Sidebar> with navigation links.
     - Implement collapse/expand logic.
     - Test responsiveness.
   - Top Panel (Header)
     - Add logo/title, Sync Indicator, Settings, and Logout.
     - Hook up logout functionality.
   - Responsive Behavior & Styling
     - Ensure mobile-friendly layout.
     - Apply consistent styling.

   **Why**: Establishes a consistent frame across all pages.

6. Implement the Home Page (Dashboard + Widgets)
   - Dashboard Slice
     - Set up dashboard slice in Redux.
     - Implement widget CRUD actions.
   - Rendering Widgets
     - Create <WidgetGrid> and <Widget> components.
     - Implement individual widget types.
   - Add Widget Flow
     - Create widget selection modal.
     - Handle widget creation and sync.
   - Editing & Removing Widgets
     - Add widget configuration controls.
     - Implement removal functionality.

   **Why**: Creates the main entry point with overview functionality.

7. Implement the Weekly Plan Page
   - Page Layout
     - Create Unscheduled Tasks sidebar.
     - Implement Weekly Calendar grid.
     - Add week navigation.
   - Drag-and-Drop Setup
     - Integrate drag-and-drop library.
     - Set up drag sources and drop targets.
   - State Management
     - Handle week selection state.
     - Implement task filtering by date.
   - Rescheduling & Sync
     - Update scheduledDate on drop.
     - Sync changes to backend.
   - Status Changes
     - Add inline status toggles.
     - Handle immediate updates and syncs.

   **Why**: Provides interactive weekly planning functionality.

8. Implement the Master List Page
    - Filter Bar & Search
      - Build filter panel with multiple criteria.
      - Implement search functionality.
    - Table/Grid Rendering
      - Create unified task/goal list view.
      - Display relevant columns.
    - Inline Editing
      - Enable direct field editing.
      - Handle debounced syncs.
    - Sorting & Pagination
      - Add sort functionality.
      - Implement pagination if needed.
    - Delete / Archive
      - Add item removal functionality.
      - Handle sync states.

    **Why**: Creates comprehensive task/goal management view.

9. Refine the Styling & Theming
    - Tailwind & Shadcn Pass
      - Ensure consistent styling.
      - Implement dark mode if applicable.
    - Focus & Hover States
      - Add appropriate interactive states.
      - Verify accessibility.
    - Animations & Micro-interactions
      - Add subtle transitions.
      - Maintain consistency.

    **Why**: Polishes the user experience with consistent styling.

10. Testing, QA, and Performance Optimization
    - Unit Tests
      - Test Redux logic.
      - Verify backend routes.
    - Integration & E2E Testing
      - Test critical user flows.
      - Verify drag-and-drop functionality.
    - Performance Checks
      - Identify and fix bottlenecks.
      - Optimize large lists if needed.
    - Accessibility Audits
      - Run accessibility checks.
      - Fix any issues found.

    **Why**: Ensures application stability and usability.

11. Deployment & Monitoring
    - Backend Deployment
      - Containerize Flask app.
      - Configure production environment.
    - Frontend Deployment
      - Deploy NextJS application.
      - Set up environment variables.
    - Monitoring & Logging
      - Implement structured logging.
      - Set up monitoring tools.
    - CD/CI Pipeline
      - Automate deployment process.
      - Create environment pipelines.

    **Why**: Establishes robust production environment and monitoring.