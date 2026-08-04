import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layouts & Protection (eager — needed on every screen)
import AuthLayout from '@/app/layouts/AuthLayout';
import ClientLayout from '@/app/layouts/ClientLayout';
import HandymanLayout from '@/app/layouts/HandymanLayout';
import AdminLayout from '@/app/layouts/AdminLayout';
import ProtectedRoute from '@/app/router/ProtectedRoute';
import RoleLayout from '@/app/router/RoleLayout';
import { PageSkeleton } from '@/components/ui/Skeleton';

// Landing Page stays eager so first paint is instant
import LandingPage from '@/features/landing/pages/LandingPage';

// Auth Pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const RoleSelectionPage = lazy(() => import('@/features/auth/pages/RoleSelectionPage'));

// Feature Pages
const ClientHomePage = lazy(() => import('@/features/client/pages/ClientHomePage'));
const ExplorePage = lazy(() => import('@/features/client/pages/ExplorePage'));
const MapPage = lazy(() => import('@/features/client/pages/MapPage'));
const ClientJobsPage = lazy(() => import('@/features/client/pages/ClientJobsPage'));
const ClientProfilePage = lazy(() => import('@/features/client/pages/ClientProfilePage'));
const SettingsPage = lazy(() => import('@/features/client/pages/SettingsPage'));
const HelpPage = lazy(() => import('@/features/client/pages/HelpPage'));
const JobsPage = lazy(() => import('@/features/handyman/pages/JobsPage'));
const MyJobsPage = lazy(() => import('@/features/handyman/pages/MyJobsPage'));
const ProfilePage = lazy(() => import('@/features/handyman/pages/ProfilePage'));
const ClientWalletPage = lazy(() => import('@/features/wallet/pages/ClientWalletPage'));
const HandymanWalletPage = lazy(() => import('@/features/wallet/pages/HandymanWalletPage'));
const ScanPaymentPage = lazy(() => import('@/features/payments/pages/ScanPaymentPage'));
const ChatPage = lazy(() => import('@/features/chat/ChatPage'));
const MessagesPage = lazy(() => import('@/features/chat/MessagesPage'));
const CommunityPage = lazy(() => import('@/features/community/pages/CommunityPage'));
const GroupPage = lazy(() => import('@/features/community/pages/GroupPage'));
const HandymanDashboardPage = lazy(() => import('@/features/handyman/pages/HandymanDashboardPage'));
const PortfolioPage = lazy(() => import('@/features/handyman/pages/PortfolioPage'));
const ProPortfolioPage = lazy(() => import('@/features/portfolio/pages/ProPortfolioPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'));
const AdminJobsPage = lazy(() => import('@/features/admin/pages/AdminJobsPage'));
const AdminCommunityPage = lazy(() => import('@/features/admin/pages/AdminCommunityPage'));
const AdminReportsPage = lazy(() => import('@/features/admin/pages/AdminReportsPage'));
const AdminVerificationPage = lazy(() => import('@/features/admin/pages/AdminVerificationPage'));
const AdminPayoutsPage = lazy(() => import('@/features/admin/pages/AdminPayoutsPage'));

function PageFallback() {
  return <PageSkeleton />;
}

function App() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={location.pathname} 
        initial={{ opacity: 0, y: 4 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -4 }} 
        transition={{ duration: .18, ease: 'easeOut' }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
            
            <Route path="/auth/select-role" element={<RoleSelectionPage />} />

            {/* Shared Community route — personalized per role (must sit outside role branches) */}
            <Route element={<ProtectedRoute allowedRoles={['client', 'handyman']} />}>
              <Route element={<RoleLayout />}>
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/groups/:groupId" element={<GroupPage />} />
              </Route>
            </Route>

            {/* Shared public pro page — any user can view any pro's portfolio */}
            <Route element={<ProtectedRoute allowedRoles={['client', 'handyman']} />}>
              <Route element={<RoleLayout />}>
                <Route path="/pro/:proId" element={<ProPortfolioPage />} />
              </Route>
            </Route>

            {/* Protected Client Routes */}
            <Route element={<ProtectedRoute allowedRoles={['client']} />}>
              <Route element={<ClientLayout />}>
                <Route path="/client/home" element={<ClientHomePage />} />
                <Route path="/client/explore" element={<ExplorePage />} />
                <Route path="/client/map" element={<MapPage />} />
                <Route path="/client/jobs" element={<ClientJobsPage />} />
                <Route path="/client/profile" element={<ClientProfilePage />} />
                <Route path="/client/settings" element={<SettingsPage />} />
                <Route path="/client/help" element={<HelpPage />} />
                <Route path="/client/wallet" element={<ClientWalletPage />} />
                <Route path="/client/payments/scan" element={<ScanPaymentPage />} />
                <Route path="/client/messages" element={<MessagesPage />} />
                <Route path="/chat/:jobId" element={<ChatPage />} />
                <Route path="/client/chat/:jobId" element={<ChatPage />} />
                <Route path="/client/chat/d/:convId" element={<ChatPage />} />
                <Route path="/client/chat/direct/:otherId" element={<ChatPage />} />
              </Route>
            </Route>

            {/* Protected Handyman Routes */}
            <Route element={<ProtectedRoute allowedRoles={['handyman']} />}>
              <Route element={<HandymanLayout />}>
                <Route path="/handyman/dashboard" element={<HandymanDashboardPage />} />
                <Route path="/handyman/jobs" element={<JobsPage />} />
                <Route path="/handyman/my-jobs" element={<MyJobsPage />} /> 
                <Route path="/handyman/portfolio" element={<PortfolioPage />} />
                <Route path="/handyman/profile" element={<ProfilePage />} />
                <Route path="/handyman/wallet" element={<HandymanWalletPage />} />
                <Route path="/handyman/payments/scan" element={<ScanPaymentPage />} />
                <Route path="/handyman/messages" element={<MessagesPage />} />
                <Route path="/handyman/chat/:jobId" element={<ChatPage />} />
                <Route path="/handyman/chat/d/:convId" element={<ChatPage />} />
                <Route path="/handyman/chat/direct/:otherId" element={<ChatPage />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/jobs" element={<AdminJobsPage />} />
                <Route path="/admin/community" element={<AdminCommunityPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/verifications" element={<AdminVerificationPage />} />
                <Route path="/admin/payouts" element={<AdminPayoutsPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
