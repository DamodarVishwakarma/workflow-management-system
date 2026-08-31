import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resolveAssignee } from '../../data/userProfiles';
import './TaskCard.css';

/**
 * TaskCard component
 * 
 * Represents a single task item inside a workflow board column.
 * 
 * Props:
 * - task: The task data object ({ id, title, description, status, priority, type, assignee })
 * - onMoveTask: Callback function (taskId, newStatus) => void when status changes
 * - canMoveTask: Boolean from AuthContext (false for Viewer role)
 */
function TaskCard({
  task,
  onMoveTask,
  onEditTask,
  onDeleteTask,
  canMoveTask = true,
}) {
  const { users = [] } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeMenu = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
      if (event.type === 'mousedown' && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeMenu);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeMenu);
    };
  }, [menuOpen]);

  const assigneeUser = resolveAssignee(users, task.assignee);

  return (
    <article className="board-task-card">
      <div className="card-label">
        <span className={`type-${task.type.toLowerCase()}`}>{task.type}</span>
        {canMoveTask && (
          <div className="task-card-actions" ref={menuRef}>
            <button
              type="button"
              className="task-card-menu-trigger"
              aria-label={`Actions for ${task.title}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
            >
              •••
            </button>
            {menuOpen && (
              <div className="task-card-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditTask(task);
                  }}
                >
                  <span aria-hidden="true">✎</span> Edit task
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="delete"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteTask(task);
                  }}
                >
                  <span aria-hidden="true">♲</span> Delete task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <h3>{task.title}</h3>
      <p>{task.description}</p>

      <div className="card-footer">
        <span className={`priority priority-${task.priority.toLowerCase()}`}>
          ◆ {task.priority}
        </span>
        <span
          className={`ws-avatar small-avatar ${assigneeUser.avatarColor || 'purple'}`}
          title={assigneeUser.name}
          aria-label={`Assigned to ${assigneeUser.name}`}
        >
          {assigneeUser.initials}
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
          className={!canMoveTask ? 'is-readonly' : undefined}
        >
          <option value="todo">To do</option>
          <option value="progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </label>
    </article>
  );
}

export default TaskCard;
