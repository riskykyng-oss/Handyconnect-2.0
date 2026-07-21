import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Protection
import AuthLayout from '@/app/layouts/AuthLayout';
import ClientLayout from '@/app/layouts/ClientLayout';
import HandymanLayout from '@/app/layouts/HandymanLayout';
import AdminLayout from '@/app/layouts/AdminLayout';
import ProtectedRoute from '@/app/router/ProtectedRoute';

// Landing Page
import LandingPage from '@/features/landing/pages/LandingPage'; // <-- NEW IMPORT

// Auth Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import RoleSelectionPage from '@/features/auth/pages/RoleSelectionPage';

// Feature Pages
import ClientHomePage from '@/features/client/pages/ClientHomePage';
import JobsPage from '@/features/handyman/pages/JobsPage';
import MyJobsPage from '@/features/handyman/pages/MyJobsPage';
import ProfilePage from '@/features/handyman/pages/ProfilePage';
import WalletPage from '@/features/wallet/WalletPage'; 
import ChatPage from '@/features/chat/ChatPage'; 
import MessagesPage from '@/features/chat/MessagesPage';
import CommunityPage from '@/features/community/pages/CommunityPage';

// Admin Pages
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage';
 import AdminJobsPage from '@/features/admin/pages/AdminJobsPage'; 

function App() {
  return (
    <Routes>
      {/* Landing Page Route */}
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      
      <Route path="/auth/select-role" element={<RoleSelectionPage />} />

      {/* Protected Client Routes */}
      <Route element={<ProtectedRoute allowedRoles={['client']} />}>
        <Route element={<ClientLayout />}>
          <Route path="/client/home" element={<ClientHomePage />} />
          <Route path="/client/messages" element={<MessagesPage />} />
          <Route path="/chat/:jobId" element={<ChatPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Route>
      </Route>

      {/* Protected Handyman Routes */}
      <Route element={<ProtectedRoute allowedRoles={['handyman']} />}>
        <Route element={<HandymanLayout />}>
          <Route path="/handyman/jobs" element={<JobsPage />} />
          <Route path="/handyman/my-jobs" element={<MyJobsPage />} /> 
          <Route path="/handyman/profile" element={<ProfilePage />} />
          <Route path="/handyman/wallet" element={<WalletPage />} />
          <Route path="/handyman/messages" element={<MessagesPage />} />
          <Route path="/handyman/chat/:jobId" element={<ChatPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          { <Route path="/admin/jobs" element={<AdminJobsPage />} /> }
        </Route>
      </Route>
    </Routes>
  );
}

export default App;