/**
 * Helper functions used to build summary data from the static task list.
 * These are simple, pure functions: they receive data and return a calculated result.
 */

export function getMyTasksCount(tasks, userInitials) {
  const activeTasks = tasks.filter((task) => {
    const isAssignedToCurrentUser = task.assignee === userInitials;
    const isNotCompleted = task.status !== 'done';

    return isAssignedToCurrentUser && isNotCompleted;
  });

  return activeTasks.length;
}

export function getRecentActivity(tasks) {
  return tasks
    .slice()
    .reverse()
    .map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      assignee: task.assignee,
      priority: task.priority,
      type: task.type,
    }));
}
