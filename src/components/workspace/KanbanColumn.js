import React from 'react';
import KanbanCard from './KanbanCard';

/**
 * KanbanColumn Component
 * 
 * Renders a column on the board with its title, task count, and task cards.
 * 
 * Props:
 * - column: Column definition object ({ id, label, tone })
 * - tasks: Array of tasks belonging to this column
 * - onMoveTask: Callback to move a task to another status
 * - onOpenCreateModal: Callback to open the create task modal
 * - canCreateTask: Boolean permission for task creation
 * - canMoveTask: Boolean permission for moving tasks
 */
function KanbanColumn({
  column,
  tasks,
  onMoveTask,
  onOpenCreateModal,
  canCreateTask = true,
  canMoveTask = true,
}) {
  return (
    <div className="kanban-column">
      {/* Column Title Header */}
      <div className="kanban-title">
        <span>
          <i className={column.tone} />
          {column.label}
        </span>
        <b>{tasks.length}</b>
        {canCreateTask && (
          <button
            onClick={onOpenCreateModal}
            aria-label={`Add task to ${column.label}`}
          >
            ＋
          </button>
        )}
      </div>

      {/* List of Task Cards in this Column */}
      <div className="kanban-list">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onMoveTask={onMoveTask}
            canMoveTask={canMoveTask}
          />
        ))}

        {/* Empty state prompt if column has 0 tasks */}
        {tasks.length === 0 && canCreateTask && (
          <button className="empty-column" onClick={onOpenCreateModal}>
            ＋ Add your first task
          </button>
        )}

        {tasks.length === 0 && !canCreateTask && (
          <div
            style={{
              padding: '24px 10px',
              textAlign: 'center',
              color: '#9aa0ac',
              fontSize: '11px',
              border: '1px dashed #d5d8de',
              borderRadius: '8px',
            }}
          >
            No tasks in {column.label}
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
