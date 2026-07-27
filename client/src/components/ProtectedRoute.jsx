import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole } from '../utils/rbac';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProtectedRoute({ allowedRoles, redirectTo = '/login' }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Checking session…" />;
  if (!user) return <Navigate to={redirectTo} replace />;
  if (allowedRoles && !hasAnyRole(user, allowedRoles)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
