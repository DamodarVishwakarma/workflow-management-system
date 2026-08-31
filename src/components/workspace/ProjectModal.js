import './ProjectModal.css';

function ProjectModal({ onClose, onCreateProject }) {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="modal-layer" role="presentation" onMouseDown={handleBackdropClick}>
      <section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <div className="project-modal-header">
          <div>
            <span className="project-modal-icon" aria-hidden="true">P</span>
            <div>
              <h2 id="project-modal-title">Create a project</h2>
              <p>Start a focused space for your team’s work.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={onCreateProject}>
          <label>
            Project name
            <input
              name="name"
              required
              autoFocus
              maxLength="60"
              placeholder="e.g. Mobile app launch"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              rows="3"
              maxLength="180"
              placeholder="What is this project trying to achieve?"
            />
          </label>
          <label>
            Project type
            <select name="type" defaultValue="Software project">
              <option>Software project</option>
              <option>Design project</option>
              <option>Marketing project</option>
              <option>Operations project</option>
            </select>
          </label>

          <div className="project-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Create project</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProjectModal;
