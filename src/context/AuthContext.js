import { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ROLE_PERMISSIONS, ROLES } from '../data/initialUsers';
import {
  flowboardApi,
  useCreateInvitationMutation,
  useGetInvitationsQuery,
  useGetUsersQuery,
  useLazyValidateInvitationQuery,
  useLoginMutation,
  useSignupMutation,
} from '../services/flowboardApi';
import { clearCredentials, setCredentials } from '../store/slices/authSlice';
import { getApiErrorMessage } from '../utils/apiError';

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
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(currentUser);
  const userRole = currentUser?.role || ROLES.VIEWER;
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.Viewer;
  const { data: users = [] } = useGetUsersQuery(undefined, { skip: !isAuthenticated });
  const { data: invitations = [] } = useGetInvitationsQuery(undefined, {
    skip: !isAuthenticated || ![ROLES.OWNER, ROLES.ADMIN].includes(userRole),
  });
  const [loginRequest] = useLoginMutation();
  const [signupRequest] = useSignupMutation();
  const [createInvitationRequest] = useCreateInvitationMutation();
  const [validateInvitationRequest] = useLazyValidateInvitationQuery();

  /**
   * Login Function:
   * Authenticates by email and password against the registered users list.
   */
  const login = async (email, password) => {
    try {
      const credentials = await loginRequest({ email: email.trim(), password }).unwrap();
      dispatch(setCredentials(credentials));
      return credentials.user;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  };

  /**
   * Validate Invite Token:
   * Checks if an invite token exists, is pending, and has not expired.
   */
  const validateInviteToken = async (token) => {
    if (!token) return { valid: false, error: 'No invitation token provided.' };
    try {
      return await validateInvitationRequest(token).unwrap();
    } catch (error) {
      return { valid: false, error: getApiErrorMessage(error) };
    }
  };

  /**
   * Create Invitation Function:
   * Generates a new invitation with a predefined role. Accessible only to Owners and Admins.
   */
  const createInvitation = async ({ email, role }) => {
    try {
      return await createInvitationRequest({ email: email.trim(), role }).unwrap();
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  };

  /**
   * Signup Function (Strict Role Enforcement):
   * 
   * Rule 1: If signing up with an inviteToken -> strictly assign role from invitation record.
   * Rule 2: If signing up directly without an inviteToken -> automatically assign OWNER role.
   * Rule 3: Client cannot pass or manipulate role.
   */
  const signup = async ({ name, email, password, inviteToken }) => {
    try {
      const credentials = await signupRequest({
        name: name.trim(),
        email: email.trim(),
        password,
        inviteToken: inviteToken || null,
      }).unwrap();
      dispatch(setCredentials(credentials));
      return credentials.user;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  };

  /**
   * Logout Function:
   * Clears the active user session.
   */
  const logout = () => {
    dispatch(clearCredentials());
    dispatch(flowboardApi.util.resetApiState());
  };

  const authValue = {
    currentUser,
    users,
    invitations,
    login,
    signup,
    logout,
    createInvitation,
    validateInviteToken,
    isAuthenticated,
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
