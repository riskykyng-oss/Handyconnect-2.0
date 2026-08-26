import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LayoutDashboard, Users, Briefcase, LogOut, Menu, X, Search, Bell, MessageSquare, Scale, BadgeCheck, Wallet } from 'lucide-react';

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Community', path: '/admin/community', icon: MessageSquare },
    { name: 'Verification', path: '/admin/verifications', icon: BadgeCheck },
    { name: 'Payouts', path: '/admin/payouts', icon: Wallet },
    { name: 'Reports', path: '/admin/reports', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-hc-page text-hc-ink flex font-sans">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Deep Dark Gray */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-hc-surface text-hc-ink z-40 transform transition-transform duration-300 flex-shrink-0 flex flex-col border-r border-hc-hairline ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          <span className="font-display font-extrabold text-xl">
            Handy<span className="text-hc-brand">Connect</span>
          </span>
          <button aria-label="Close menu" className="md:hidden text-hc-ink-3 h-11 w-11 flex items-center justify-center" onClick={() => setSidebarOpen(false)}><X size={22} /></button>
        </div>

        <div className="px-6 mb-6">
          <span className="bg-hc-brand-50 text-hc-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Admin Portal</span>
        </div>

        <nav className="mt-2 px-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-hc-brand-50 text-hc-brand-strong border-l-hc-brand' : 'text-hc-ink-2 hover:bg-hc-brand-50/50 hover:text-hc-ink'
                }`}
              >
                <item.icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-hc-hairline flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-hc-brand flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
              {currentUser?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-hc-ink">{currentUser?.email}</p>
              <p className="text-xs text-hc-ink-3">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-hc-ink-2 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-hc-hairline bg-white/80 px-4 py-3 backdrop-blur-md md:px-8">
          <button aria-label="Open navigation menu" className="md:hidden text-hc-ink h-11 w-11 flex items-center justify-center" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md bg-hc-page rounded-full px-4 py-2.5">
            <Search size={17} className="text-hc-ink-3" />
            <input
              type="search"
              aria-label="Search users, jobs, reports"
              placeholder="Search users, jobs, reports..."
              className="w-full bg-transparent outline-none text-sm text-hc-ink placeholder:text-hc-ink-3"
            />
          </div>

          <span className="md:hidden font-display font-extrabold text-lg flex-1 text-center text-hc-ink">
            Handy<span className="text-hc-brand">Connect</span>
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button aria-label="Notifications" className="relative w-10 h-10 rounded-full hover:bg-hc-page flex items-center justify-center transition-colors">
              <Bell size={19} className="text-hc-ink-2" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-hc-brand rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-hc-ink flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
              {currentUser?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
