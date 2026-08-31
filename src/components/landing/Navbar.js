import Logo from '../common/Logo';
import Icon from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../router';
import './Navbar.css';

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

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <a className="button small" href="#app">
                Workspace ({currentUser?.initials || 'User'})
              </a>
              <button
                type="button"
                className="nav-logout-button"
                onClick={handleLogout}
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
