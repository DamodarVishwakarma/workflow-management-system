/**
 * 🎓 Initial Workspace Invitations Seed Data
 * 
 * Demonstrates invitation-based onboarding in React.
 * Each invitation record ties an invited email address to a predefined, locked role.
 */

export const seedInvitations = [
  {
    id: 'inv-1',
    token: 'inv_admin_demo',
    email: 'new.admin@flowboard.io',
    role: 'Admin',
    invitedBy: 'Alex Morgan (alex@flowboard.io)',
    workspaceName: 'Website redesign',
    status: 'pending', // 'pending' | 'accepted' | 'expired'
    createdAt: '2026-08-31T10:00:00Z',
    expiresAt: '2026-09-07T10:00:00Z',
  },
  {
    id: 'inv-2',
    token: 'inv_member_demo',
    email: 'designer@flowboard.io',
    role: 'Member',
    invitedBy: 'Alex Morgan (alex@flowboard.io)',
    workspaceName: 'Website redesign',
    status: 'pending',
    createdAt: '2026-08-31T10:00:00Z',
    expiresAt: '2026-09-07T10:00:00Z',
  },
  {
    id: 'inv-3',
    token: 'inv_viewer_demo',
    email: 'client@flowboard.io',
    role: 'Viewer',
    invitedBy: 'Sarah Jenkins (sarah@flowboard.io)',
    workspaceName: 'Website redesign',
    status: 'pending',
    createdAt: '2026-08-31T10:00:00Z',
    expiresAt: '2026-09-07T10:00:00Z',
  },
];
