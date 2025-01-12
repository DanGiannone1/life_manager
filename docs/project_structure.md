# Project Tree

```text
life-manager/
├── docs/
│   ├── design_document.md         # Complete system design document
│   ├── project_structure.md       # This file - explains the project organization
│   └── task_plan.md              # Development tasks and timeline
│
├── backend/
│   ├── app.py                    # Routes and business logic
│   ├── cosmos_db.py             # Database operations
│   ├── testing.py               # Test data generation and cleanup
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json        # App-specific TypeScript config
│   ├── tsconfig.node.json       # Node-specific TypeScript config
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js         # ESLint configuration
│   ├── components.json          # shadcn/ui component configuration
│   │
│   ├── src/
│   │   ├── main.tsx            # Application entry point
│   │   ├── App.tsx            # Root component and routing
│   │   │
│   │   ├── components/
│   │   │   ├── animations/    # CSS animations
│   │   │   │   └── StatusCheckAnimation.css
│   │   │   │
│   │   │   ├── layouts/      # Layout components
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopPanel.tsx
│   │   │   │
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   └── table.tsx
│   │   │   │
│   │   │   └── task/        # Task-specific components
│   │   │       ├── TaskCard.tsx     # Compact, draggable version
│   │   │       ├── TaskDetails.tsx  # Detailed task view dialog
│   │   │       ├── TaskTable.tsx    # Table container & sorting
│   │   │       └── TaskTableRow.tsx # Full task info in tabular format
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── WeeklyPlanPage.tsx    # Uses TaskCard for calendar
│   │   │   └── MasterListPage.tsx    # Uses TaskTable + TaskTableRow
│   │   │
│   │   ├── state/
│   │   │   ├── slices/
│   │   │   │   ├── taskSlice.ts     # Task state and reducers
│   │   │   │   └── syncSlice.ts     # Sync state and reducers
│   │   │   ├── logger.ts            # Logging middleware and utilities
│   │   │   └── syncEngine.ts        # Store setup + sync orchestration
│   │   │
│   │   ├── utils/
│   │   │   ├── api.ts              # API client
│   │   │   ├── displayMappings.ts  # UI display configurations
│   │   │   ├── types.ts            # TypeScript interfaces
│   │   │   └── utils.ts            # Utility functions
│   │   │
│   │   └── styles/
│   │       └── globals.css         # Global styles and Tailwind imports
│   │
│   └── public/
│       └── assets/
│
├── README.md
└── .gitignore
```

# Frontend Hierarchy & Styling Architecture

## Core Style Configuration

### 1. Type Definitions (`src/utils/types.ts`)
- TypeScript interfaces and type definitions for:
  - Task interfaces
  - Status types
  - Recurrence types
  - State interfaces
  - Common type definitions

### 2. Display Mappings (`src/utils/displayMappings.ts`)
- Status colors and display text
- Priority range definitions and colors
- Effort level display configurations
- Recurrence display formatting
- All UI-related constants and helper functions
- Color definitions for statuses, priorities, etc.

### 3. Theme Configuration (`tailwind.config.js`)
- Core design tokens:
  - Base color palette
  - Typography settings
  - Spacing scales
  - Border radius values
  - Dark/light mode variables

### 4. Global Styles (`src/styles/globals.css`)
- Tailwind imports
- CSS variables
- Dark/light mode schemes
- Base element styles

### 5. UI Components (`src/components/ui/`)
- shadcn/ui base components
- Consistent styling patterns
- Theme token usage

## Component Hierarchy

### Root Component (`App.tsx`)
- Redux Provider configuration
- Router implementation
- AppLayout wrapper

### Layout Components

#### `AppLayout.tsx` (`src/components/layouts/`)
- Main layout wrapper
- Core page structure
- Sidebar state management
- Responsive layout handling
- TopPanel and Sidebar integration

#### `TopPanel.tsx` (`src/components/layouts/`)
- Application header
- Sync status display
- Settings controls
- Authentication controls

#### `Sidebar.tsx` (`src/components/layouts/`)
- Navigation menu
- Collapsible functionality
- Route management
- Active state handling

### Content Pages (`src/pages/`)
- HomePage.tsx
- WeeklyPlanPage.tsx
- MasterListPage.tsx

### Task Components (`src/components/task/`)

#### `TaskTable.tsx`
- Task list container
- Table structure
- Column management

#### `TaskTableRow.tsx`
- Individual task display
- Status management
- Priority display
- Action handlers

#### `TaskCard.tsx`
- Compact task display
- Drag-and-drop support
- Status indicators

#### `TaskDetails.tsx`
- Full task information
- Edit capabilities
- Modal dialog

### Animation Components (`src/components/animations/`)
- StatusCheckAnimation.css
- Task status transitions
- UI feedback animations

