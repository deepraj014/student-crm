// Replace your entire App.tsx with this:

import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";

import AdminUserManagement from "./components/Admin/AdminUserManagement";
import AccountPending from "./components/auth/AccountPending";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected route component
const ProtectedRoute = ({
  children,
  requiredRole,
  requiredStatus = "active",
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "agent" | "student";
  requiredStatus?: "active" | "pending";
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if user is pending approval
  if (currentUser.status === "pending") {
    return <Navigate to="/account-pending" />;
  }

  // Check if user status matches required
  if (currentUser.status !== requiredStatus) {
    return <Navigate to="/login" />;
  }

  // Check role requirement
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/dashboard" />; // Redirect to their appropriate dashboard
  }

  return <>{children}</>;
};

// Smart dashboard redirect based on role
const DashboardRedirect = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  if (currentUser.status === "pending") {
    return <Navigate to="/account-pending" />;
  }

  // Redirect to role-specific dashboard
  switch (currentUser.role) {
    case "admin":
      return <Navigate to="/admin/user-management" />;
    case "agent":
    case "student":
      return <Dashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/:token" element={<Register />} />
          <Route path="/account-pending" element={<AccountPending />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/user-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />

          {/* Agent/Student dashboard */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute requiredRole="agent">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
