import { AuthProvider } from './context/AuthContext';
import { HashRouter as Router, Routes, Route } from './router';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WorkspacePage from './pages/WorkspacePage';
import ProtectedRoute from './components/common/ProtectedRoute';

/**
 * 🎓 Main Application Component with Authentication & Routing
 * 
 * Key Architecture Highlights:
 * -----------------------------
 * 1. <AuthProvider>:
 *    Wraps the whole app so any page/component can access user details, login,
 *    signup, and role permissions via `useAuth()`.
 * 
 * 2. <Router> & <Routes>:
 *    Declarative client-side routing based on URL hash (`/`, `/login`, `/signup`, `/app`).
 * 
 * 3. <ProtectedRoute>:
 *    Auth Guard that protects `/app`. If not logged in, it shows <LoginPage />.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Marketing Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Workspace Application (Requires Login) */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <WorkspacePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback Route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
