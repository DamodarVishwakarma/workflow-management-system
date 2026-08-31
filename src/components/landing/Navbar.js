import React from 'react';
import Logo from '../common/Logo';
import Icon from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../router';

/**
 * Main navigation bar for the landing page.
 * Uses authentication state to show "Sign in" / "Get started" or "Open Workspace" / "Log out".
 */
function Navbar() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <header>
      <nav className="nav container" aria-label="Main navigation">
        <Logo />

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated ? (
            <>
              <a className="button small" href="#app">
                Workspace ({currentUser?.initials || 'User'})
              </a>
              <button
                onClick={handleLogout}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  border: '1px solid #fed2d6',
                  borderRadius: '6px',
                  background: '#fff0f1',
                  color: '#c33e4d',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="#login">Sign in</a>
              <a className="button small" href="#signup">
                Get started
              </a>
            </>
          )}
        </div>

        <button className="menu" aria-label="Open navigation">
          <Icon name="menu" />
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
