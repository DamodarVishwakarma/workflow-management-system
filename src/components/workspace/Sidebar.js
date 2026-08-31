import React from 'react';

/**
 * Helper component for displaying icons in the navigation list.
 */
function NavIcon({ children }) {
  return (
    <span className="ws-nav-icon" aria-hidden="true">
      {children}
    </span>
  );
}

/**
 * 🎓 Workspace Sidebar Component with User Profile & 1-Click Logout
 * 
 * Props:
 * - sidebarOpen: Boolean indicating if sidebar is open on mobile.
 * - setSidebarOpen: Function to toggle sidebar.
 * - activeView: Currently selected workspace view.
 * - onViewChange: Function used to select a workspace view.
 */
function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTaskCount,
  activeView,
  onViewChange,
  projects,
  activeProjectId,
  onProjectChange,
  onCreateProject,
  canCreateProject,
}) {
  const selectView = (view) => {
    onViewChange(view);
    setSidebarOpen(false);
  };

  const selectProject = (projectId) => {
    onProjectChange(projectId);
    onViewChange('overview');
    setSidebarOpen(false);
  };

  return (
    <>
      <aside className={`ws-sidebar${sidebarOpen ? ' open' : ''}`}>
        <a className="ws-brand" href="#top">
          <span className="ws-logo">
            <i />
            <i />
            <i />
          </span>
          FlowBoard
        </a>

        <nav aria-label="Workspace navigation">
          <span className="ws-label">Workspace</span>

          <button
            type="button"
            className={activeView === 'overview' ? 'selected' : ''}
            onClick={() => selectView('overview')}
            aria-current={activeView === 'overview' ? 'page' : undefined}
          >
            <NavIcon>⌂</NavIcon> Overview
          </button>

          <button
            type="button"
            className={activeView === 'my-tasks' ? 'selected' : ''}
            onClick={() => selectView('my-tasks')}
            aria-current={activeView === 'my-tasks' ? 'page' : undefined}
          >
            <NavIcon>▦</NavIcon> My tasks <small>{activeTaskCount}</small>
          </button>

          <button
            type="button"
            className={activeView === 'activity' ? 'selected' : ''}
            onClick={() => selectView('activity')}
            aria-current={activeView === 'activity' ? 'page' : undefined}
          >
            <NavIcon>◷</NavIcon> Activity
          </button>

          <span className="ws-label project-label">
            Projects
            {canCreateProject && (
              <button
                type="button"
                className="add-project-button"
                onClick={onCreateProject}
                aria-label="Create project"
              >
                ＋
              </button>
            )}
          </span>

          {projects.map((project) => (
            <button
              type="button"
              key={project.id}
              className={`project-link${activeProjectId === project.id ? ' active' : ''}`}
              onClick={() => selectProject(project.id)}
              aria-current={activeProjectId === project.id ? 'page' : undefined}
            >
              <span className="project-badge">{project.name.charAt(0).toUpperCase()}</span>
              <span>
                {project.name}
                <small>{project.type}</small>
              </span>
            </button>
          ))}
        </nav>

      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
