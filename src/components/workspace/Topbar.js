import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../router';

/**
 * 🎓 Workspace Topbar Component
 * 
 * Features:
 * - Search input for global task search.
 * - Sleek, clickable User Profile Menu with dropdown for account details & Logout.
 */
function Topbar({ query, setQuery, onOpenSidebar }) {
  const { currentUser, logout, role, roleBadgeColor } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const initials = currentUser?.initials || 'U';
  const avatarClass = currentUser?.avatarColor || 'purple';
  const userName = currentUser?.name || 'User';
  const userEmail = currentUser?.email || 'user@flowboard.io';

  return (
    <header className="ws-topbar">
      {/* Mobile burger button to toggle sidebar */}
      <button className="mobile-menu" onClick={onOpenSidebar} aria-label="Open menu">
        ☰
      </button>

      {/* Global search input */}
      <label className="global-search">
        <span>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          aria-label="Search tasks"
        />
        <kbd>⌘ K</kbd>
      </label>

      {/* Top right user menu dropdown */}
      <div style={{ marginLeft: 'auto', position: 'relative' }} ref={dropdownRef}>
        {currentUser && (
          <>
            {/* Clickable User Pill Trigger */}
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px 5px 6px',
                borderRadius: '24px',
                background: dropdownOpen ? '#eee9fc' : '#f4f5f8',
                border: '1px solid',
                borderColor: dropdownOpen ? '#6957d9' : '#dfe2e8',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s ease',
              }}
              title="Click to view profile & logout options"
            >
              <span className={`ws-avatar ${avatarClass}`} style={{ width: '26px', height: '26px', fontSize: '10px' }}>
                {initials}
              </span>
              <strong style={{ fontSize: '13px', color: '#1e2430', fontWeight: 700 }}>
                {userName}
              </strong>
              <span className={`role-tag ${roleBadgeColor}`} style={{ fontSize: '10px', padding: '2px 7px' }}>
                {role}
              </span>
              <span style={{ fontSize: '10px', color: '#8c93a0', marginLeft: '2px' }}>
                {dropdownOpen ? '▲' : '▼'}
              </span>
            </div>

            {/* Sleek User Profile Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '230px',
                  background: '#ffffff',
                  border: '1px solid #e1e4ea',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(25, 33, 43, 0.12)',
                  padding: '14px',
                  zIndex: 100,
                  boxSizing: 'border-box',
                }}
              >
                {/* User Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span className={`ws-avatar ${avatarClass}`} style={{ width: '36px', height: '36px', fontSize: '12px' }}>
                    {initials}
                  </span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a202c' }}>
                      {userName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#7a828e', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {userEmail}
                    </div>
                  </div>
                </div>

                {/* Role Badge Description */}
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#f7f8fa',
                    border: '1px solid #edf0f5',
                    fontSize: '11px',
                    color: '#555e6d',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Role:</span>
                  <span className={`role-tag ${roleBadgeColor}`}>{role}</span>
                </div>

                <div style={{ height: '1px', background: '#edf0f4', margin: '8px 0 10px' }} />

                {/* Quick Link to Landing Page */}
                <a
                  href="#top"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    color: '#4a5568',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginBottom: '4px',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f7f8fa')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>🏠</span> FlowBoard Home
                </a>

                {/* Prominent Log out button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: '1px solid #fed2d6',
                    borderRadius: '6px',
                    background: '#fff0f1',
                    color: '#c33e4d',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '6px',
                    transition: 'all 0.15s',
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
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default Topbar;
