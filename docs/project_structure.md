life-manager/
├── docs/
│   ├── design_doc.md         # Complete system design document
│   ├── project_structure.md  # This file - explains the project organization
│   └── task_plan.md         # Development tasks and timeline
│
├── backend/
│   ├── app.py               # Routes and business logic
│   ├── cosmos_db.py         # Database operations
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   ├── src/
│   │   ├── main.tsx         # Application entry point
│   │   ├── App.tsx         # Root component and routing
│   │   │
│   │   ├── components/
│   │   │   ├── ui/         # Add shadcn components as needed
│   │   │   │
│   │   │   └── task/       # Task-specific components
│   │   │       ├── TaskTable.tsx      # Table container & sorting
│   │   │       ├── TaskTableRow.tsx   # Full task info in tabular format
│   │   │       ├── TaskCard.tsx       # Compact, draggable version
│   │   │       └── TaskDetails.tsx    # Shared task display logic
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── WeeklyPlanPage.tsx    # Uses TaskCard for calendar
│   │   │   └── MasterListPage.tsx    # Uses TaskTable + TaskTableRow
│   │   │
│   │   ├── state/
│   │   │   ├── slices/
│   │   │   │   ├── taskSlice.ts      # Task state and reducers
│   │   │   │   └── syncSlice.ts      # Sync state and reducers
│   │   │   ├── logger.ts             # Logging middleware and utilities
│   │   │   └── syncEngine.ts         # Store setup + sync orchestration
│   │   │
│   │   ├── utils/
│   │   │   ├── types.ts     # Interfaces from design doc
│   │   │   └── api.ts       # API client
│   │   │
│   │   └── styles/
│   │       └── globals.css
│   │
│   └── public/
│       └── assets/
│
├── README.md
└── .gitignore


# Frontend Hierarchy

## Root Components

### `App.tsx`
- Root component that provides core setup:
  - Redux Provider configuration
  - Router implementation
  - Implements AppLayout for main structure

### `AppLayout.tsx`
- Main layout wrapper component:
  - Accepts `containerWidth` prop for content control
  - Wraps content in base Layout component
  - Manages container max-width constraints

### `Layout.tsx`
- Base layout component responsible for:
  - Managing sidebar state
  - Implementing core structure:
    - TopPanel
    - Sidebar
    - Main content area
  - Handling responsive behaviors

## Layout Components

### `TopPanel.tsx`
- Header component that displays:
  - Sync status
  - Settings
  - Other top-level controls

### `Sidebar.tsx`
- Navigation sidebar component:
  - Contains main navigation menu
  - Handles collapsible state