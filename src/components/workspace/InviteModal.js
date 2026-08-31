import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../../data/initialUsers';
import './InviteModal.css';

/**
 * 🎓 InviteModal Component
 * 
 * Allows Workspace Owners and Admins to invite team members with a strictly predefined role:
 * - ADMIN: Workspace Administrator
 * - MEMBER: Team Collaborator
 * - VIEWER: Read-only Stakeholder
 */
function InviteModal({ onClose }) {
  const { createInvitation, invitations, isOwner } = useAuth();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.MEMBER);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    setError('');
    setCopied(false);

    try {
      const invite = createInvitation({ email, role });
      const fullUrl = `${window.location.origin}${window.location.pathname}#/signup?invite=${invite.token}`;
      setGeneratedLink(fullUrl);
      setEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="modal-layer"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="invite-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        {/* Header */}
        <div className="invite-modal-head">
          <div>
            <h2 id="invite-modal-title">Invite to Workspace</h2>
            <p>Assign a predefined role and generate an invitation link</p>
          </div>
          <button
            type="button"
            className="invite-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="invite-modal-body">
          {error && (
            <div className="auth-error invite-modal-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Invitation Form */}
          <form onSubmit={handleSendInvite}>
            <div className="form-group invite-email-field">
              <label htmlFor="invite-email">Recipient Email Address</label>
              <input
                id="invite-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>

            <div className="form-group invite-role-field">
              <label htmlFor="invite-role">Assign Role (Enforced on Signup)</label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {/* Owners can invite Admins, Members, and Viewers. Admins can invite Members and Viewers. */}
                {isOwner && <option value={ROLES.ADMIN}>Admin (Workspace Manager)</option>}
                <option value={ROLES.MEMBER}>Member (Create & Edit Tasks)</option>
                <option value={ROLES.VIEWER}>Viewer (Read-Only Access)</option>
              </select>
            </div>

            <button
              type="submit"
              className="auth-submit-btn invite-submit-button"
            >
              Generate Invite Link
            </button>
          </form>

          {/* Generated Link Box */}
          {generatedLink && (
            <div className="invite-copy-box">
              <input
                readOnly
                value={generatedLink}
                className="invite-copy-input"
                aria-label="Generated invitation link"
              />
              <button
                type="button"
                className="copy-btn"
                onClick={handleCopyLink}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          )}

          {/* Pending Invitations List */}
          <div className="invitation-list-section">
            <h4 className="invitation-list-title">
              Workspace Invitations
            </h4>
            <div className="invitation-list">
              {invitations.map((inv) => {
                const badgeClass = ROLE_PERMISSIONS[inv.role]?.badgeColor || 'purple';
                const invUrl = `${window.location.origin}${window.location.pathname}#/signup?invite=${inv.token}`;

                return (
                  <div
                    key={inv.id}
                    className="invitation-list-item"
                  >
                    <div>
                      <strong className="invitation-email">{inv.email}</strong>
                      <small className="invitation-status-label">
                        Status: <span className={`invitation-status ${inv.status}`}>{inv.status}</span>
                      </small>
                    </div>

                    <div className="invitation-actions">
                      <span className={`role-tag ${badgeClass}`}>
                        {inv.role}
                      </span>
                      {inv.status === 'pending' && (
                        <button
                          type="button"
                          className="invitation-copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(invUrl);
                            alert('Invitation link copied to clipboard!');
                          }}
                        >
                          Copy Link
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InviteModal;
