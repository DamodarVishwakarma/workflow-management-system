import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../router';

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
 * - activeTaskCount: Number of active tasks assigned to the current user.
 */
function Sidebar({ sidebarOpen, setSidebarOpen, activeTaskCount }) {
  const { currentUser, logout, role, roleBadgeColor } = useAuth();
  const navigate = useNavigate();

  // Instant logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = currentUser?.initials || 'U';
  const userName = currentUser?.name || 'Guest User';
  const userEmail = currentUser?.email || 'guest@flowboard.io';
  const avatarClass = currentUser?.avatarColor || 'purple';

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

          <button className="selected">
            <NavIcon>⌂</NavIcon> Overview
          </button>

          <button>
            <NavIcon>▦</NavIcon> My tasks <small>{activeTaskCount}</small>
          </button>

          <button>
            <NavIcon>◷</NavIcon> Activity
          </button>

          <span className="ws-label project-label">
            Projects <b>＋</b>
          </span>

          <button className="project-link">
            <span className="project-badge">W</span>
            <span>
              Website redesign
              <small>Software project</small>
            </span>
          </button>
        </nav>

        <div className="sidebar-help">
          <span>?</span>
          <div>
            <strong>Need a hand?</strong>
            <small>Visit the help center</small>
          </div>
        </div>

        {/* User Profile & Clear Always-Visible Logout Button */}
        <div className="ws-user-box" style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
            <span className={`ws-avatar ${avatarClass}`}>
              {initials}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </strong>
                <span className={`role-tag ${roleBadgeColor}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                  {role}
                </span>
              </div>
              <small style={{ color: '#888f9c', fontSize: '11px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </small>
            </div>
          </div>

          {/* Direct 1-Click Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1px solid #fed2d6',
              borderRadius: '7px',
              background: '#fff0f1',
              color: '#c33e4d',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#fde2e4';
              e.currentTarget.style.borderColor = '#f8b4bb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#fff0f1';
              e.currentTarget.style.borderColor = '#fed2d6';
            }}
          >
            <span>🚪</span> Log out
          </button>
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
