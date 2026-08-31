import React, { useState } from 'react';
import '../auth.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from '../router';
import Logo from '../components/common/Logo';

/**
 * 🎓 LoginPage Component
 * 
 * Clean, standard authentication:
 * - Enter registered email & password to sign in.
 * - Redirects directly to the Kanban Workspace (`/app`).
 */
function LoginPage() {
  const { login, currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Standard form submission handler
  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Sign in</h1>
          <p>Access your team's workflow boards and tasks</p>
        </div>

        {/* If user is already signed in */}
        {isAuthenticated && currentUser && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#f0edfc',
              border: '1px solid #d5cff7',
              fontSize: '13px',
              color: '#4937a8',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              Currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role}).
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/app')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#6957d9',
                  color: '#fff',
                  border: 0,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Go to Workspace
              </button>
              <button
                type="button"
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#c33e4d',
                  border: '1px solid #fed2d6',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="auth-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Standard Login Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@flowboard.io"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in to Workspace'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create a new workspace</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
