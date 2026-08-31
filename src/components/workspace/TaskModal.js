import React from 'react';

/**
 * TaskModal Component
 * 
 * A dialog form popup to create and add a new task to the board.
 * 
 * Props:
 * - onClose: Function to close the modal dialog.
 * - onCreateTask: Form submit handler function.
 */
function TaskModal({ onClose, onCreateTask }) {
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
        aria-labelledby="new-task-title"
      >
        {/* Modal Header */}
        <div className="modal-head">
          <div>
            <span className="modal-icon">✓</span>
            <div>
              <h2 id="new-task-title">Create a task</h2>
              <p>Add a clear, actionable item to your board.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onCreateTask}>
          <label>
            Task title
            <input
              name="title"
              required
              autoFocus
              maxLength="80"
              placeholder="What needs to be done?"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              rows="3"
              placeholder="Add useful context for your team"
            />
          </label>

          <div className="form-grid">
            <label>
              Type
              <select name="type">
                <option>Task</option>
                <option>Design</option>
                <option>Development</option>
                <option>Research</option>
                <option>Content</option>
              </select>
            </label>

            <label>
              Priority
              <select name="priority">
                <option>Medium</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </label>

            <label>
              Status
              <select name="status">
                <option value="todo">To do</option>
                <option value="progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit">
              Create task
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskModal;
