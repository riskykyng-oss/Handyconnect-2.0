import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import ClientLayout from '@/app/layouts/ClientLayout';
import HandymanLayout from '@/app/layouts/HandymanLayout';

// Renders the app shell that matches the logged-in role so a single
// /community route works for both clients and handymen.
export default function RoleLayout() {
  const { userRole } = useAuth();
  const Layout = userRole === 'handyman' ? HandymanLayout : ClientLayout;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
