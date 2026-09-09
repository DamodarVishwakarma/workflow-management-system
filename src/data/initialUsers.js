/**
 * Role Definitions & Permission Matrix
 * 
 * - Owner: Workspace Creator with full administrative control (can invite Admins/Members/Viewers, manage workspace)
 * - Admin: Workspace Administrator (can invite Members/Viewers, manage all tasks)
 * - Member: Standard Collaborator (can create and move tasks)
 * - Viewer: Read-only Collaborator (can view boards and progress, cannot modify tasks)
 */
export const ROLES = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

export const ROLE_PERMISSIONS = {
  Owner: {
    canCreateTask: true,
    canMoveTask: true,
    canInvite: true,
    canManageRoles: true,
    badgeColor: 'purple',
    description: 'Workspace Owner with full administrative control',
  },
  Admin: {
    canCreateTask: true,
    canMoveTask: true,
    canInvite: true,
    canManageRoles: false,
    badgeColor: 'purple',
    description: 'Workspace Administrator with task & team management',
  },
  Member: {
    canCreateTask: true,
    canMoveTask: true,
    canInvite: false,
    canManageRoles: false,
    badgeColor: 'blue',
    description: 'Can create and update task workflows',
  },
  Viewer: {
    canCreateTask: false,
    canMoveTask: false,
    canInvite: false,
    canManageRoles: false,
    badgeColor: 'green',
    description: 'Read-only access to view boards and progress',
  },
};
