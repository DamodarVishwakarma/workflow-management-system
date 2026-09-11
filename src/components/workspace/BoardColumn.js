import TaskCard from './TaskCard';
import Icon from '../common/Icon';
import './BoardColumn.css';

/**
 * BoardColumn component
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
function BoardColumn({
  column,
  tasks,
  onMoveTask,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  canCreateTask = true,
  canMoveTask = true,
}) {
  return (
    <div className="board-column">
      {/* Column Title Header */}
      <div className="board-column-title">
        <span>
          <i className={column.tone} />
          {column.label}
        </span>
        <b>{tasks.length}</b>
        {canCreateTask && (
          <button
            onClick={() => onOpenCreateModal(column.id)}
            aria-label={`Add task to ${column.label}`}
          >
            <Icon name="plus" size={14} />
          </button>
        )}
      </div>

      {/* List of Task Cards in this Column */}
      <div className="board-task-list">
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

        {/* Empty state prompt if column has 0 tasks */}
        {tasks.length === 0 && canCreateTask && (
          <button className="empty-column" onClick={() => onOpenCreateModal(column.id)}>
            <Icon name="plus" size={13} />
            <span>Add your first task</span>
          </button>
        )}

        {tasks.length === 0 && !canCreateTask && (
          <div className="empty-column-message">
            No tasks in {column.label}
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardColumn;
