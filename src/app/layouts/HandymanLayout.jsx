import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Briefcase, ClipboardCheck, Wallet, Users, UserCircle, LogOut, Bell, Home, MessageSquare, Images, Menu, X } from 'lucide-react';
import useUnreadCount from '@/hooks/useUnreadCount';
import useNotifications from '@/hooks/useNotifications';
import NotificationPopup from '@/components/notifications/NotificationPopup';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

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

// Mobile bottom nav — 5 items, Instagram-style. Dashboard is the primary (center) action.
const bottomNav = [
  { name: 'Work', path: '/handyman/jobs', icon: Briefcase },
  { name: 'My Jobs', path: '/handyman/my-jobs', icon: ClipboardCheck },
  { name: 'Dashboard', path: '/handyman/dashboard', icon: Home, primary: true },
  { name: 'Messages', path: '/handyman/messages', icon: MessageSquare },
  { name: 'Community', path: '/community', icon: Users },
];

function SidebarContent({ onNavigate, unread }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-full flex-col">
      <Link to="/handyman/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-5 pt-7 pb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hc-brand text-xs font-extrabold text-white">
          HC
        </div>
        <span className="font-display text-base font-extrabold tracking-tight text-hc-ink">
          Handy<span className="text-hc-brand">Connect</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {nav.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`group relative flex min-h-11 items-center gap-3 rounded-lg border-l-2 pl-3 pr-3 py-2 text-sm font-semibold transition-all ${
                active
                  ? 'border-hc-brand bg-hc-brand-50 text-hc-brand-strong'
                  : 'border-transparent text-hc-ink-2 hover:bg-hc-brand-50/50 hover:text-hc-ink'
              }`}
            >
              <Icon size={17} className={active ? 'text-hc-brand' : 'text-hc-ink-3 group-hover:text-hc-brand'} />
              <span className="flex-1">{item.name}</span>
              {item.name === 'Messages' && unread > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-hc-brand px-1.5 text-[10px] font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hc-hairline px-3 py-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hc-page text-xs font-semibold text-hc-ink-2">
            {currentUser?.email?.[0]?.toUpperCase() || 'H'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-hc-ink">{currentUser?.displayName || 'Handyman'}</p>
            <p className="text-xs text-hc-caption">Professional</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-hc-ink-3 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function HandymanLayout() {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const isChatPage = pathname.startsWith('/handyman/chat') || pathname === '/handyman/messages';
  const isChatThread = pathname.startsWith('/handyman/chat');
  const unread = useUnreadCount();
  const { notifications, unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex min-h-screen justify-center bg-hc-page font-sans text-hc-ink">
      <NotificationPopup notifications={notifications} />
      <div className="flex w-full max-w-[1500px]">
        {/* Desktop sidebar (>=1024px) — 280px */}
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-hc-hairline bg-hc-tile lg:flex">
          <SidebarContent unread={unread} />
        </aside>

        {/* Tablet drawer (768-1023px, opened via hamburger) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-hc-hairline bg-hc-tile shadow-xl">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 flex h-11 w-11 items-center justify-center rounded-lg text-hc-ink-2 hover:bg-hc-page"
              >
                <X size={20} />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} unread={unread} />
            </aside>
          </div>
        )}

        {/* Main */}
        <main className={`flex min-w-0 flex-1 flex-col md:pb-0 ${isChatPage ? 'pb-0' : 'pb-[calc(6rem+env(safe-area-inset-bottom))]'}`}>
          {/* Top bar — tablet (hamburger + brand) + desktop (bell + profile) */}
          <div className={`sticky top-0 z-30 border-b border-hc-hairline bg-white/80 backdrop-blur-md ${isChatPage ? 'hidden md:block' : 'block'}`}>
            <div className="flex items-center gap-3 px-4 py-3 lg:justify-end lg:px-7 lg:py-3">
              {/* Hamburger + brand: tablet only (<1024px, >=768px) */}
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-hc-ink-2 hover:bg-hc-page md:flex lg:hidden"
              >
                <Menu size={20} />
              </button>
              <Link
                to="/handyman/dashboard"
                className="flex items-center gap-2 md:flex lg:hidden"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hc-brand text-xs font-extrabold text-white">
                  HC
                </div>
                <span className="font-display text-sm font-extrabold tracking-tight text-hc-ink">
                  Handy<span className="text-hc-brand">Connect</span>
                </span>
              </Link>

              <div className="flex-1" />

              <div className="relative">
                <button
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-lg text-hc-ink-2 transition-colors hover:bg-hc-page"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hc-brand px-1 text-[9px] font-bold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  open={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  currentUser={currentUser}
                />
              </div>
              <div className="hidden items-center gap-2 lg:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-hc-page text-[10px] font-semibold text-hc-ink-2">
                  {currentUser?.email?.[0]?.toUpperCase() || 'H'}
                </div>
                <span className="text-sm font-medium text-hc-ink-2">{currentUser?.displayName || 'Handyman'}</span>
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav (<768px) — Instagram style */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t border-hc-hairline bg-white/95 backdrop-blur-xl ${isChatThread ? 'hidden' : 'md:hidden'}`}>
        <div className="flex h-[calc(4rem+env(safe-area-inset-bottom))] items-center justify-around pb-[env(safe-area-inset-bottom)]">
          {bottomNav.map((item) => {
            const active = pathname === item.path;
            const Icon = item.icon;
            if (item.primary) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex h-full w-full flex-col items-center justify-center gap-0.5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-hc-brand text-white shadow-lg shadow-hc-brand/30 -mt-3 transition-transform hover:scale-105 active:scale-95">
                    <Icon size={22} />
                  </div>
                  <span className="text-[9px] font-bold text-hc-brand -mt-0.5">{item.name}</span>
                </Link>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex h-full w-full flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-hc-brand' : 'text-hc-ink-3'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {item.name === 'Messages' && unread > 0 && (
                  <span className="absolute right-[calc(50%-18px)] top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hc-brand px-1 text-[9px] font-bold text-white">
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
