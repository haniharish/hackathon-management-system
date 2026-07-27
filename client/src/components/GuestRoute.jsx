import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GuestRoute({ redirectTo = '/dashboard' }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Loading…" />;
  if (user) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
