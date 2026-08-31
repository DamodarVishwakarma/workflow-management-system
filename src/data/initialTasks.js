/**
 * Default starter tasks loaded when the user opens the application for the first time.
 * Storing data in a separate file keeps your React components clean and focused on UI logic!
 */
export const seedTasks = [
  {
    id: 'FLW-24',
    title: 'Create new landing page',
    description: 'Design and implement the new marketing page.',
    status: 'todo',
    priority: 'High',
    type: 'Design',
    assignee: 'AM',
  },
  {
    id: 'FLW-19',
    title: 'Review user feedback',
    description: 'Group recent feedback into actionable themes.',
    status: 'todo',
    priority: 'Medium',
    type: 'Research',
    assignee: 'KS',
  },
  {
    id: 'FLW-31',
    title: 'Build responsive navigation',
    description: 'Create navigation behavior across all breakpoints.',
    status: 'progress',
    priority: 'High',
    type: 'Development',
    assignee: 'JR',
  },
  {
    id: 'FLW-27',
    title: 'Write onboarding copy',
    description: 'Draft concise copy for the first-run experience.',
    status: 'progress',
    priority: 'Low',
    type: 'Content',
    assignee: 'AM',
  },
  {
    id: 'FLW-08',
    title: 'Define project scope',
    description: 'Agree on the MVP goals and deferred functionality.',
    status: 'done',
    priority: 'Medium',
    type: 'Planning',
    assignee: 'KS',
  },
];

/**
 * Kanban board columns configuration.
 * Each column has a unique 'id' that matches the task 'status' ('todo', 'progress', or 'done').
 */
export const columns = [
  { id: 'todo', label: 'To do', tone: 'neutral' },
  { id: 'progress', label: 'In progress', tone: 'blue' },
  { id: 'done', label: 'Done', tone: 'green' },
];
