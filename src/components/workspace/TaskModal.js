
/**
 * TaskModal Component
 * 
 * A dialog form used to create or edit a task.
 * 
 * Props:
 * - onClose: Function to close the modal dialog.
 * - onCreateTask: Form submit handler function.
 */
function TaskModal({ onClose, onCreateTask, onUpdateTask, task = null }) {
  const isEditing = Boolean(task);
  // Close modal if user clicks on the outer dark backdrop
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-layer"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        {/* Modal Header */}
        <div className="modal-head">
          <div>
            <span className="modal-icon">✓</span>
            <div>
              <h2 id="task-modal-title">{isEditing ? 'Edit task' : 'Create a task'}</h2>
              <p>{isEditing ? 'Update this task’s details.' : 'Add a clear, actionable item to your board.'}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={isEditing ? onUpdateTask : onCreateTask}>
          <label>
            Task title
            <input
              name="title"
              required
              autoFocus
              maxLength="80"
              defaultValue={task?.title || ''}
              placeholder="What needs to be done?"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              rows="3"
              defaultValue={task?.description || ''}
              placeholder="Add useful context for your team"
            />
          </label>

          <div className="form-grid">
            <label>
              Type
              <select name="type" defaultValue={task?.type || 'Task'}>
                <option>Task</option>
                <option>Design</option>
                <option>Development</option>
                <option>Research</option>
                <option>Content</option>
                <option>Planning</option>
              </select>
            </label>

            <label>
              Priority
              <select name="priority" defaultValue={task?.priority || 'Medium'}>
                <option>Medium</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </label>

            <label>
              Status
              <select name="status" defaultValue={task?.status || 'todo'}>
                <option value="todo">To do</option>
                <option value="progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <label>
            Due date
            <input name="dueDate" type="date" defaultValue={task?.dueDate || ''} />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit">
              {isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskModal;
