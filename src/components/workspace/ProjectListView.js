import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resolveAssignee } from '../../data/userProfiles';
import Icon from '../common/Icon';
import './ProjectViews.css';

function ProjectListView({ tasks, onMoveTask, onEditTask, onDeleteTask, canManageTasks }) {
  const { users = [] } = useAuth();
  const [sortBy, setSortBy] = useState('dueDate');

  const sortedTasks = useMemo(() => [...tasks].sort((first, second) => {
    if (sortBy === 'title') return first.title.localeCompare(second.title);
    if (sortBy === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[first.priority] - order[second.priority];
    }
    return (first.dueDate || '9999').localeCompare(second.dueDate || '9999');
  }), [tasks, sortBy]);

  return (
    <section className="project-list-view" aria-label="Task list">
      <div className="project-view-toolbar">
        <div><strong>Task list</strong><span>{tasks.length} tasks</span></div>
        <label>Sort by
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
      {sortedTasks.length ? (
        <div className="task-table-wrap">
          <table className="task-table">
            <thead><tr><th>Task</th><th>Assignee</th><th>Priority</th><th>Due date</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {sortedTasks.map((task) => {
                const assignee = resolveAssignee(users, task.assignee);
                return (
                  <tr key={task.id}>
                    <td><strong>{task.title}</strong><small>{task.id} · {task.type}</small></td>
                    <td><span className={`list-assignee ${assignee.avatarColor}`}>{assignee.initials}</span>{assignee.name}</td>
                    <td><span className={`list-priority ${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                    <td>{task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString() : 'No date'}</td>
                    <td>
                      <select value={task.status} disabled={!canManageTasks} onChange={(event) => onMoveTask(task.id, event.target.value)} aria-label={`Status for ${task.title}`}>
                        <option value="todo">To do</option><option value="progress">In progress</option><option value="done">Done</option>
                      </select>
                    </td>
                    <td>
                      {canManageTasks && <div className="list-row-actions">
                        <button type="button" onClick={() => onEditTask(task)} aria-label={`Edit ${task.title}`}><Icon name="edit" size={16} /></button>
                        <button type="button" className="delete" onClick={() => onDeleteTask(task)} aria-label={`Delete ${task.title}`}><Icon name="trash" size={16} /></button>
                      </div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <div className="project-view-empty"><h2>No tasks yet</h2><p>Create a task to populate this list.</p></div>}
    </section>
  );
}

export default ProjectListView;
