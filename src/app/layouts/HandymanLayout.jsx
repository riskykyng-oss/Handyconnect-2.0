import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Briefcase, ClipboardCheck, Wallet, Users, UserCircle, LogOut, Bell, Home, MessageSquare, Images } from 'lucide-react';
import useUnreadCount from '@/hooks/useUnreadCount';

const nav = [
  { name: 'Dashboard', path: '/handyman/dashboard', icon: Home },
  { name: 'Find Work', path: '/handyman/jobs', icon: Briefcase },
  { name: 'My Jobs', path: '/handyman/my-jobs', icon: ClipboardCheck },
  { name: 'Portfolio', path: '/handyman/portfolio', icon: Images },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Wallet', path: '/handyman/wallet', icon: Wallet },
  { name: 'Messages', path: '/handyman/messages', icon: MessageSquare },
  { name: 'Profile', path: '/handyman/profile', icon: UserCircle },
];

const bottomNav = [
  { name: 'Work', path: '/handyman/jobs', icon: Briefcase },
  { name: 'My Jobs', path: '/handyman/my-jobs', icon: ClipboardCheck },
  { name: 'Portfolio', path: '/handyman/portfolio', icon: Images },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Messages', path: '/handyman/messages', icon: MessageSquare },
  { name: 'Wallet', path: '/handyman/wallet', icon: Wallet },
  { name: 'Profile', path: '/handyman/profile', icon: UserCircle },
];

export default function HandymanLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unread = useUnreadCount();

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 font-sans text-gray-900">
      <div className="flex w-full max-w-[1500px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
          <div className="flex items-center gap-2.5 px-5 pt-7 pb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold text-white">
              HC
            </div>
            <span className="text-base font-bold tracking-tight">
              Handy<span className="text-orange-500">Connect</span>
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-3">
            {nav.map((item) => {
              const active = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={17} className={active ? 'text-orange-500' : 'text-gray-400'} />
                  <span className="flex-1">{item.name}</span>
                  {item.name === 'Messages' && unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 px-3 py-4">
            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                {currentUser?.email?.[0]?.toUpperCase() || 'H'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{currentUser?.displayName || 'Handyman'}</p>
                <p className="text-xs text-gray-500">Professional</p>
              </div>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/auth/login'); }}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 hidden border-b border-gray-200 bg-white lg:flex items-center justify-end gap-4 px-7 py-3">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600">
                {currentUser?.email?.[0]?.toUpperCase() || 'H'}
              </div>
              <span className="text-sm font-medium text-gray-700">{currentUser?.displayName || 'Handyman'}</span>
            </div>
          </div>

          <Outlet />
        </main>
      </div>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {bottomNav.map((item) => {
            const active = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex h-full w-full flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {item.name === 'Messages' && unread > 0 && (
                  <span className="absolute right-[calc(50%-22px)] top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
