import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../../data/initialUsers';

/**
 * 🎓 InviteModal Component
 * 
 * Allows Workspace Owners and Admins to invite team members with a strictly predefined role:
 * - ADMIN: Workspace Administrator
 * - MEMBER: Team Collaborator
 * - VIEWER: Read-only Stakeholder
 */
function InviteModal({ onClose }) {
  const { createInvitation, invitations, currentUser, isOwner } = useAuth();

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
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 0,
              fontSize: '22px',
              cursor: 'pointer',
              color: '#88909d',
            }}
          >
            ×
          </button>
        </div>

        <div className="invite-modal-body">
          {error && (
            <div className="auth-error" role="alert" style={{ marginBottom: '16px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Invitation Form */}
          <form onSubmit={handleSendInvite}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
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

            <div className="form-group" style={{ marginBottom: '16px' }}>
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
              className="auth-submit-btn"
              style={{ marginTop: '4px', height: '40px', fontSize: '13px' }}
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
          <div style={{ marginTop: '24px', borderTop: '1px solid #edf0f5', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workspace Invitations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {invitations.map((inv) => {
                const badgeClass = ROLE_PERMISSIONS[inv.role]?.badgeColor || 'purple';
                const invUrl = `${window.location.origin}${window.location.pathname}#/signup?invite=${inv.token}`;

                return (
                  <div
                    key={inv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#2d3748', display: 'block' }}>{inv.email}</strong>
                      <small style={{ color: '#a0aec0' }}>
                        Status: <span style={{ color: inv.status === 'accepted' ? '#38a169' : '#d69e2e', fontWeight: 600 }}>{inv.status}</span>
                      </small>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`role-tag ${badgeClass}`}>
                        {inv.role}
                      </span>
                      {inv.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(invUrl);
                            alert('Invitation link copied to clipboard!');
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: '#edf2f7',
                            border: '1px solid #cbd5e0',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
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
