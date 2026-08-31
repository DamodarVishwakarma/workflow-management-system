import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * KanbanCard Component
 * 
 * Represents a single task item card inside a Kanban column.
 * 
 * Props:
 * - task: The task data object ({ id, title, description, status, priority, type, assignee })
 * - onMoveTask: Callback function (taskId, newStatus) => void when status changes
 * - canMoveTask: Boolean from AuthContext (false for Viewer role)
 */
function KanbanCard({ task, onMoveTask, canMoveTask = true }) {
  const { users = [] } = useAuth();

  const assigneeUser =
    users.find((user) => user.initials === task.assignee) ||
    users.find((user) => user.name === task.assignee) || {
      initials: task.assignee,
      avatarColor: '#9176b0',
    };

  return (
    <article className="kanban-card">
      <div className="card-label">
        <span className={`type-${task.type.toLowerCase()}`}>{task.type}</span>
        <button aria-label={`Options for ${task.title}`}>•••</button>
      </div>

      <h3>{task.title}</h3>
      <p>{task.description}</p>

      <div className="card-footer">
        <span className={`priority priority-${task.priority.toLowerCase()}`}>
          ◆ {task.priority}
        </span>
        <span
          className="ws-avatar small-avatar"
          style={{ background: assigneeUser.avatarColor || '#9176b0' }}
        >
          {assigneeUser.initials || task.assignee}
        </span>
      </div>

      {/* Task status switcher */}
      <label className="move-task">
        <span>Move to</span>
        <small className="issue-key">{task.id}</small>
        <select
          value={task.status}
          disabled={!canMoveTask}
          onChange={(e) => onMoveTask(task.id, e.target.value)}
          aria-label={`Change status for ${task.title}`}
          title={!canMoveTask ? 'View-only access' : 'Change status'}
          style={!canMoveTask ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        >
          <option value="todo">To do</option>
          <option value="progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </label>
    </article>
  );
}

export default KanbanCard;
