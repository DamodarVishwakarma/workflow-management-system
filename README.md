# FlowBoard — Workflow Management System

A focused workflow-management capstone built with React and JavaScript.

## Run locally

```bash
npm install
npm start
```

## MVP plan

The first release will prove the central workflow: create a project, add issues, and move work through a board.

### 1. Application shell

- Responsive sidebar and top navigation
- Project switcher
- Board and issue routes
- Friendly empty, loading, and error states

### 2. Project management

- List projects
- Create, edit, and archive a project
- Project name, key, description, and icon/color

### 3. Issue management

- Create, view, edit, and delete issues
- Issue types: task, bug, and story
- Title, description, status, priority, assignee, and due date
- Human-readable issue keys such as `WEB-12`

### 4. Workflow board

- Columns: To Do, In Progress, and Done
- Drag issues between columns
- Quick-add an issue from a column
- Issue cards show type, key, priority, and assignee

### 5. Search and filtering

- Search by issue title or key
- Filter by assignee, type, and priority
- Clear filters in one action

### 6. Persistence and quality

- Start with local browser storage so the frontend is fully demonstrable
- Seed data for first-time users
- Unit tests for state and key components
- Responsive layout and baseline keyboard accessibility

## Suggested implementation phases

1. Foundation: routing, layout, design tokens, types, and seed data.
2. Core data: project and issue state with local persistence.
3. Board: columns, cards, issue form, and drag-and-drop.
4. Discovery: search, filters, and project switching.
5. Quality: tests, accessibility pass, responsive polish, and deployment.

## Intentionally deferred

Authentication, multi-user collaboration, comments, attachments, notifications, sprints, reporting, activity history, and a backend API are outside the first release. The architecture will leave room to add them later.
