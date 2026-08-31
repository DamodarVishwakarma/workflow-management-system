import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * BoardHeader Component
 * 
 * Displays breadcrumbs, project heading, team avatar stack, and action buttons.
 * 
 * Props:
 * - onOpenCreateModal: Function to open the "Create a task" modal dialog.
 * - onOpenInviteModal: Function to open the "Invite" modal dialog.
 * - canCreateTask: Boolean permission indicating if current user can create tasks.
 * - canInvite: Boolean permission indicating if current user can invite team members.
 */
function BoardHeader({
  onOpenCreateModal,
  onOpenInviteModal,
  canCreateTask = true,
  canInvite = true,
}) {
  const { users = [] } = useAuth();

  const visibleMembers = users.slice(0, 3);
  const extraMembers = Math.max(users.length - visibleMembers.length, 0);

  return (
    <>
      {/* Breadcrumb path */}
      <div className="breadcrumbs">
        <a href="#app">Projects</a>
        <span>/</span>
        <b>Website redesign</b>
      </div>

      {/* Project title and header action buttons */}
      <div className="project-heading">
        <div>
          <div className="title-row">
            <h1>Website redesign</h1>
            <button aria-label="Favorite project">☆</button>
          </div>
          <p>Plan, design, and launch the new company website.</p>
        </div>

        <div className="heading-actions">
          <span className="member-stack">
            {visibleMembers.map((member) => (
              <i
                key={member.id}
                style={{ background: member.avatarColor || '#9176b0' }}
              >
                {member.initials || member.name?.slice(0, 2).toUpperCase()}
              </i>
            ))}
            {extraMembers > 0 && <i className="member-overflow">+{extraMembers}</i>}
          </span>
          {canInvite && (
            <button className="secondary" onClick={onOpenInviteModal}>
              ＋ Invite
            </button>
          )}
          {canCreateTask && (
            <button className="primary" onClick={onOpenCreateModal}>
              ＋ Create task
            </button>
          )}
        </div>
      </div>

      {/* Project View Tabs */}
      <div className="view-tabs">
        <button className="active">Board</button>
        <button>List</button>
        <button>
          Timeline <span>Coming soon</span>
        </button>
        <button>Files</button>
        <button className="more">•••</button>
      </div>
    </>
  );
}

export default BoardHeader;
