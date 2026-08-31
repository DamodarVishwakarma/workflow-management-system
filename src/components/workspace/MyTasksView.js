import React from 'react';
import TaskCard from './TaskCard';
import './WorkspaceViews.css';

function MyTasksView({
  tasks,
  userName,
  onMoveTask,
  onEditTask,
  onDeleteTask,
  canMoveTask,
}) {
  const completedCount = tasks.filter((task) => task.status === 'done').length;

  return (
    <section className="workspace-view" aria-labelledby="my-tasks-title">
      <header className="workspace-view-header">
        <div>
          <span className="workspace-view-eyebrow">Personal workspace</span>
          <h1 id="my-tasks-title">My tasks</h1>
          <p>Everything assigned to {userName}, collected in one focused view.</p>
        </div>
        <div className="view-summary-chip">
          <strong>{tasks.length - completedCount}</strong>
          <span>Active tasks</span>
        </div>
      </header>

      {tasks.length > 0 ? (
        <div className="my-task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMoveTask={onMoveTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              canMoveTask={canMoveTask}
            />
          ))}
        </div>
      ) : (
        <div className="workspace-empty-state">
          <span aria-hidden="true">✓</span>
          <h2>You’re all caught up</h2>
          <p>No tasks are currently assigned to you.</p>
        </div>
      )}
    </section>
  );
}

export default MyTasksView;
