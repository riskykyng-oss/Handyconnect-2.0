import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import RoleLayout from '@/app/router/RoleLayout';

// /community is public (read-only for guests) and role-aware for members,
// so the landing page "View full feed" link works without an account.
export default function CommunityLayout() {
  const { currentUser } = useAuth();

  if (!currentUser) return <Outlet />;

  return <RoleLayout />;
}
