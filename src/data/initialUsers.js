/**
 * 🎓 Initial Users & Roles Seed Data
 * 
 * Demonstrates Authentication & Role-Based Authorization in React.
 * Each user object contains credentials, profile details, and role permissions.
 */

export const seedUsers = [
  {
    id: 'usr-1',
    name: 'Alex Morgan',
    email: 'admin@gmail.com',
    password: '123',
    role: 'Owner',
    initials: 'AM',
    avatarColor: 'purple',
    title: 'Workspace Creator & Lead',
  },
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 'sarah@flowboard.io',
    password: 'password123',
    role: 'Admin',
    initials: 'SJ',
    avatarColor: 'purple',
    title: 'Project Admin',
  },
  {
    id: 'usr-3',
    name: 'David Chen',
    email: 'david@flowboard.io',
    password: 'password123',
    role: 'Member',
    initials: 'DC',
    avatarColor: 'blue',
    title: 'Senior Developer',
  },
  {
    id: 'usr-4',
    name: 'Jordan Reed',
    email: 'jordan@flowboard.io',
    password: 'password123',
    role: 'Viewer',
    initials: 'JR',
    avatarColor: 'green',
    title: 'Stakeholder / Client',
  },
  {
    id: 'usr-5',
    name: 'Katherine Scott',
    email: 'katherine@flowboard.io',
    password: 'password123',
    role: 'Member',
    initials: 'KS',
    avatarColor: 'purple',
    title: 'UX Researcher',
  },
];

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
