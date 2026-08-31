import React from 'react';
import { useAuth } from '../../context/AuthContext';

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
}) {
  const { currentUser, role, roleBadgeColor } = useAuth();

  const initials = currentUser?.initials || 'U';
  const userName = currentUser?.name || 'Guest User';
  const userEmail = currentUser?.email || 'guest@flowboard.io';
  const avatarClass = currentUser?.avatarColor || 'purple';

  const selectView = (view) => {
    onViewChange(view);
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
            Projects <b>＋</b>
          </span>

          <button
            type="button"
            className="project-link"
            onClick={() => selectView('overview')}
          >
            <span className="project-badge">W</span>
            <span>
              Website redesign
              <small>Software project</small>
            </span>
          </button>
        </nav>

        <div className="ws-user-box">
          <div className="ws-user-profile">
            <span className={`ws-avatar ${avatarClass}`}>
              {initials}
            </span>
            <div className="ws-user-details">
              <div className="ws-user-heading">
                <strong className="ws-user-name">
                  {userName}
                </strong>
                <span className={`role-tag ${roleBadgeColor} ws-user-role`}>
                  {role}
                </span>
              </div>
              <small className="ws-user-email">
                {userEmail}
              </small>
            </div>
          </div>

        </div>
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
