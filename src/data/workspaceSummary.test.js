import { seedTasks } from './initialTasks';
import { getMyTasksCount, getRecentActivity } from './workspaceSummary';

describe('workspace summary helpers', () => {
  test('counts only active tasks assigned to the current user', () => {
    expect(getMyTasksCount(seedTasks, 'AM')).toBe(2);
    expect(getMyTasksCount(seedTasks, 'JR')).toBe(1);
  });

  test('creates activity items from the static task data', () => {
    const activity = getRecentActivity(seedTasks);

    expect(activity.length).toBeGreaterThan(0);
    expect(activity.some((item) => item.title === 'Create new landing page')).toBe(true);
    expect(activity.some((item) => item.title === 'Define project scope')).toBe(true);
  });
});
