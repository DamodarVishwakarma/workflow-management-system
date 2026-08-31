import React, { useState, useEffect } from 'react';
import '../auth.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from '../router';
import Logo from '../components/common/Logo';
import { ROLE_PERMISSIONS } from '../data/initialUsers';

/**
 * 🎓 SignupPage Component (Clean Onboarding)
 * 
 * Flow:
 * 1. Direct Signup: User enters Name, Email, Password -> Creates a new workspace as Owner.
 * 2. Invited Signup: If visiting via invite link (?invite=token), email is pre-filled and locked to invitation.
 * 3. Role is managed securely in the backend/AuthContext without requiring unnecessary form fields.
 */
function SignupPage() {
  const { signup, currentUser, logout, isAuthenticated, validateInviteToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Invitation status state
  const [invitationInfo, setInvitationInfo] = useState(null);
  const [inviteError, setInviteError] = useState('');

  // Validate invitation token if present in URL
  useEffect(() => {
    if (inviteToken) {
      const validation = validateInviteToken(inviteToken);
      if (validation.valid) {
        setInvitationInfo(validation.invitation);
        setEmail(validation.invitation.email || '');
        setInviteError('');
      } else {
        setInviteError(validation.error);
        setInvitationInfo(null);
      }
    } else {
      setInvitationInfo(null);
      setInviteError('');
    }
  }, [inviteToken]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Create user with backend-enforced role
      signup({
        name,
        email,
        password,
        inviteToken: invitationInfo ? inviteToken : null,
      });

      navigate('/app');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const invitePermissions = invitationInfo ? ROLE_PERMISSIONS[invitationInfo.role] : null;

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>{invitationInfo ? 'Accept Invitation' : 'Create your workspace'}</h1>
          <p>
            {invitationInfo
              ? `You've been invited to collaborate on ${invitationInfo.workspaceName}`
              : 'Set up your team workspace in seconds'}
          </p>
        </div>

        {/* Currently signed in alert */}
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

        {/* Invalid/Expired Invitation Alert */}
        {inviteError && (
          <div className="auth-error" role="alert">
            <span>⚠️</span> {inviteError}
          </div>
        )}

        {/* General form submission error */}
        {error && (
          <div className="auth-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Invited User Banner (Only shown when accepting an invite) */}
        {invitationInfo && (
          <div className="invite-info-box">
            <div className="invite-info-header">
              <strong>✉️ Invited by {invitationInfo.invitedBy}</strong>
              {invitePermissions && (
                <span className={`readonly-role-badge ${invitePermissions.badgeColor}`}>
                  Role: {invitationInfo.role}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Clean Signup Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">
              Email address
              {invitationInfo && <small style={{ color: '#6957d9' }}>(Locked to invite)</small>}
            </label>
            <input
              id="signup-email"
              type="email"
              required
              disabled={!!invitationInfo}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading || (inviteToken && !invitationInfo)}
          >
            {isLoading
              ? 'Setting up account...'
              : invitationInfo
              ? `Accept Invite & Join`
              : 'Create Workspace'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
