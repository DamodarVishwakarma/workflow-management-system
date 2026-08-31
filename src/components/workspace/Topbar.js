import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../router';
import './Topbar.css';

/**
 * 🎓 Workspace Topbar Component
 * 
 * Features:
 * - Sleek, clickable User Profile Menu with dropdown for account details & Logout.
 */
function Topbar({ onOpenSidebar }) {
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

  return (
    <header className="ws-topbar">
      {/* Mobile burger button to toggle sidebar */}
      <button className="mobile-menu" onClick={onOpenSidebar} aria-label="Open menu">
        ☰
      </button>

      {/* Top right user menu dropdown */}
      <div className="profile-menu" ref={dropdownRef}>
        {currentUser && (
          <>
            {/* Clickable User Pill Trigger */}
            <button
              type="button"
              className={`profile-menu-trigger${dropdownOpen ? ' is-open' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              title="Click to view profile & logout options"
            >
              <span className={`ws-avatar ${avatarClass} profile-menu-avatar`}>
                {initials}
              </span>
              <strong className="profile-menu-name">
                {userName}
              </strong>
              <span className={`role-tag ${roleBadgeColor} profile-menu-role`}>
                {role}
              </span>
              <span className="profile-menu-chevron" aria-hidden="true">
                {dropdownOpen ? '▲' : '▼'}
              </span>
            </button>

            {/* Sleek User Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="profile-dropdown">
                {/* Prominent Log out button */}
                <button
                  type="button"
                  className="profile-logout-button"
                  onClick={handleLogout}
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
