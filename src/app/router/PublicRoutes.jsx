import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ProtectedRoute() {
  const { currentUser, userRole, loading } = useAuth();

  // 1. If Firebase is still checking auth state, show a loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  // 2. If no user is logged in, send to login page
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. If logged in but NO ROLE selected yet, send to role selection page
  if (!userRole) {
    return <Navigate to="/auth/select-role" replace />;
  }

  // 4. If logged in AND has a role, allow them in!
  return <Outlet />;
}