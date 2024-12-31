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

### 3. Task Management

#### Task Types
1. **Recurring Tasks**
   - Configurable frequency (daily, weekly, monthly, custom)
   - Last completion tracking
   - Next due date calculation
   - Streak tracking
   - Categories/tags support

2. **One-time Tasks**
   - Due date
   - Priority levels
   - Status tracking
   - Categories/tags support



## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "created_at": "timestamp",
  "settings": {
    "theme": "string",
    "notifications_enabled": "boolean"
  }
}
```

### Task (Base)
```json
{
  "id": "string",
  "user_id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "priority": "enum(low, medium, high)",
  "status": "enum(pending, in_progress, completed)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### RecurringTask (extends Task)
```json
{
  // Inherits Task properties
  "frequency": {
    "type": "enum(daily, weekly, monthly, custom)",
    "interval": "number",
    "custom_days": ["number"] // Optional, for custom frequency
  },
  "last_completed": "timestamp",
  "next_due": "timestamp",
  "completion_history": [{
    "completed_at": "timestamp",
    "streak": "number"
  }]
}
```

### OneTimeTask (extends Task)
```json
{
  // Inherits Task properties
  "due_date": "timestamp",
  "completed_at": "timestamp"
}
```

## API Endpoints


### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/complete` - Mark task as complete
- `GET /api/tasks/recurring` - List recurring tasks
- `GET /api/tasks/one-time` - List one-time tasks


