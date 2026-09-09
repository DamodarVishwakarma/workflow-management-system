/**
 * Workflow board columns configuration.
 * Each column has a unique 'id' that matches the task 'status' ('todo', 'progress', or 'done').
 */
export const columns = [
  { id: 'todo', label: 'To do', tone: 'neutral' },
  { id: 'progress', label: 'In progress', tone: 'blue' },
  { id: 'done', label: 'Done', tone: 'green' },
];
