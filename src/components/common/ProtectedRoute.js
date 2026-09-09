import { useAuth } from '../../context/AuthContext';
import LoginPage from '../../pages/LoginPage';

/**
 * 🎓 ProtectedRoute Component
 * 
 * Protects private pages (such as WorkspacePage).
 * If the user is logged in, it renders the protected children.
 * If the user is NOT logged in, it gracefully presents the LoginPage.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return children;
}

export default ProtectedRoute;
