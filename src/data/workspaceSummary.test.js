import { getMyTasksCount, getRecentActivity } from './workspaceSummary';

const mockTasks = [
  { id: 'FLW-24', title: 'Create new landing page', status: 'todo', assignee: 'AM', priority: 'High', type: 'Design' },
  { id: 'FLW-19', title: 'Review user feedback', status: 'todo', assignee: 'KS', priority: 'Medium', type: 'Research' },
  { id: 'FLW-31', title: 'Build responsive navigation', status: 'progress', assignee: 'JR', priority: 'High', type: 'Development' },
  { id: 'FLW-27', title: 'Write onboarding copy', status: 'progress', assignee: 'AM', priority: 'Low', type: 'Content' },
  { id: 'FLW-08', title: 'Define project scope', status: 'done', assignee: 'KS', priority: 'Medium', type: 'Planning' },
];

describe('workspace summary helpers', () => {
  test('counts only active tasks assigned to the current user', () => {
    expect(getMyTasksCount(mockTasks, 'AM')).toBe(2);
    expect(getMyTasksCount(mockTasks, 'JR')).toBe(1);
  });

  test('creates activity items from the static task data', () => {
    const activity = getRecentActivity(mockTasks);

    expect(activity.length).toBeGreaterThan(0);
    expect(activity.some((item) => item.title === 'Create new landing page')).toBe(true);
    expect(activity.some((item) => item.title === 'Define project scope')).toBe(true);
  });
});
