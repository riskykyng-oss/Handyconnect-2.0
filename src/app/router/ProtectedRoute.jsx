import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (!userRole) {
    return <Navigate to="/auth/select-role" replace />;
  }

  // If the user's role is not in the allowedRoles array, send them to their actual dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'client') return <Navigate to="/client/home" replace />;
    if (userRole === 'handyman') return <Navigate to="/handyman/jobs" replace />;
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}