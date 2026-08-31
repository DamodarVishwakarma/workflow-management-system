import React, { createContext, useContext, useState, useEffect } from 'react';
import { seedUsers, ROLE_PERMISSIONS, ROLES } from '../data/initialUsers';
import { seedInvitations } from '../data/initialInvitations';

/**
 * 🎓 React Context for Authentication & Role-Based Authorization
 * 
 * Enforces:
 * 1. Automatic `OWNER` role assignment for new workspace creators.
 * 2. Invitation-based onboarding for all other users (`Admin`, `Member`, `Viewer`).
 * 3. Strict backend/context validation of invite tokens during account creation.
 * 4. Zero client-side role manipulation.
 */

const AuthContext = createContext(null);

// Helper function to extract 2-letter uppercase initials from full name
export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthProvider({ children }) {
  // 1. Registered Users State
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('flowboard-users');
      return stored ? JSON.parse(stored) : seedUsers;
    } catch {
      return seedUsers;
    }
  });

  // 2. Active User Session State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('flowboard-current-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 3. Workspace Invitations State
  const [invitations, setInvitations] = useState(() => {
    try {
      const stored = localStorage.getItem('flowboard-invitations');
      return stored ? JSON.parse(stored) : seedInvitations;
    } catch {
      return seedInvitations;
    }
  });

  // Sync users with localStorage
  useEffect(() => {
    localStorage.setItem('flowboard-users', JSON.stringify(users));
  }, [users]);

  // Sync currentUser with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('flowboard-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('flowboard-current-user');
    }
  }, [currentUser]);

  // Sync invitations with localStorage
  useEffect(() => {
    localStorage.setItem('flowboard-invitations', JSON.stringify(invitations));
  }, [invitations]);

  /**
   * Login Function:
   * Authenticates by email and password against the registered users list.
   */
  const login = (email, password) => {
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!foundUser) {
      throw new Error('No account found with this email address. Please sign up or check your spelling.');
    }

    if (foundUser.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    setCurrentUser(foundUser);
    return foundUser;
  };

  /**
   * Validate Invite Token:
   * Checks if an invite token exists, is pending, and has not expired.
   */
  const validateInviteToken = (token) => {
    if (!token) {
      return { valid: false, error: 'No invitation token provided.' };
    }

    const invitation = invitations.find((inv) => inv.token === token);
    if (!invitation) {
      return { valid: false, error: 'Invalid invitation token. The link may be broken.' };
    }

    if (invitation.status !== 'pending') {
      return { valid: false, error: 'This invitation has already been accepted or revoked.' };
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return { valid: false, error: 'This invitation has expired. Please request a new invite.' };
    }

    return { valid: true, invitation };
  };

  /**
   * Create Invitation Function:
   * Generates a new invitation with a predefined role. Accessible only to Owners and Admins.
   */
  const createInvitation = ({ email, role }) => {
    if (!currentUser) {
      throw new Error('You must be logged in to send invitations.');
    }

    const permissions = ROLE_PERMISSIONS[currentUser.role];
    if (!permissions || !permissions.canInvite) {
      throw new Error('You do not have permission to invite users to this workspace.');
    }

    // Admins cannot invite Owners or Admins (only Members or Viewers)
    if (currentUser.role === ROLES.ADMIN && (role === ROLES.OWNER || role === ROLES.ADMIN)) {
      throw new Error('Admins can only invite Members or Viewers.');
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists in workspace
    const userAlreadyExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (userAlreadyExists) {
      throw new Error('A user with this email is already a member of this workspace.');
    }

    // Generate secure token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const newInvite = {
      id: `inv-${Date.now()}`,
      token,
      email: cleanEmail,
      role: role || ROLES.MEMBER,
      invitedBy: `${currentUser.name} (${currentUser.email})`,
      workspaceName: 'Website redesign',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    setInvitations((prev) => [newInvite, ...prev]);
    return newInvite;
  };

  /**
   * Signup Function (Strict Role Enforcement):
   * 
   * Rule 1: If signing up with an inviteToken -> strictly assign role from invitation record.
   * Rule 2: If signing up directly without an inviteToken -> automatically assign OWNER role.
   * Rule 3: Client cannot pass or manipulate role.
   */
  const signup = ({ name, email, password, inviteToken }) => {
    const cleanEmail = email.toLowerCase().trim();

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    let assignedRole = ROLES.OWNER;
    let userTitle = 'Workspace Creator & Lead';

    if (inviteToken) {
      const validation = validateInviteToken(inviteToken);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { invitation } = validation;

      if (invitation.email && invitation.email.toLowerCase() !== cleanEmail) {
        throw new Error(`This invitation was sent to ${invitation.email}. Please use that email.`);
      }

      // Enforce the role assigned in the invitation record
      assignedRole = invitation.role;
      userTitle =
        assignedRole === ROLES.ADMIN
          ? 'Workspace Administrator'
          : assignedRole === ROLES.MEMBER
          ? 'Team Collaborator'
          : 'Project Viewer';

      // Mark invitation as accepted
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.token === inviteToken ? { ...inv, status: 'accepted' } : inv
        )
      );
    } else {
      // Direct registration creates a new workspace -> automatically assigned OWNER
      assignedRole = ROLES.OWNER;
      userTitle = 'Workspace Creator & Lead';
    }

    const initials = getInitials(name);
    const colors = ['purple', 'blue', 'green', 'orange'];
    const avatarColor = colors[users.length % colors.length];

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      initials,
      avatarColor,
      title: userTitle,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  /**
   * Logout Function:
   * Clears the active user session.
   */
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('flowboard-current-user');
    } catch (e) {
      console.error('Error removing session:', e);
    }
  };

  const userRole = currentUser?.role || ROLES.VIEWER;
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.Viewer;

  const authValue = {
    currentUser,
    users,
    invitations,
    login,
    signup,
    logout,
    createInvitation,
    validateInviteToken,
    isAuthenticated: !!currentUser,
    role: userRole,
    isOwner: userRole === ROLES.OWNER,
    isAdmin: userRole === ROLES.ADMIN,
    isMember: userRole === ROLES.MEMBER,
    isViewer: userRole === ROLES.VIEWER,
    canCreateTask: permissions.canCreateTask,
    canMoveTask: permissions.canMoveTask,
    canInvite: permissions.canInvite,
    canManageRoles: permissions.canManageRoles,
    roleBadgeColor: permissions.badgeColor,
    roleDescription: permissions.description,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
