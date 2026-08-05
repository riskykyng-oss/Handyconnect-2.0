import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Home, Search, Briefcase, MessageSquare, User, Bell,
  Users, Settings, LogOut, MapPin, ChevronDown, Map,
  HelpCircle, Menu, X,
} from 'lucide-react';
import WalletCard from '@/features/client/components/WalletCard';
import NotificationsPreview from '@/features/client/components/NotificationsPreview';
import MobileBottomNav from '@/features/client/components/MobileBottomNav';
import RailUpcomingJobs from '@/features/client/components/RailUpcomingJobs';
import RailRecentMessages from '@/features/client/components/RailRecentMessages';
import RailWeeklySummary from '@/features/client/components/RailWeeklySummary';
import useUnreadCount from '@/hooks/useUnreadCount';
import useNotifications from '@/hooks/useNotifications';
import { markAllNotificationsRead, markNotificationRead } from '@/services/notificationService';
import { timeAgo } from '@/utils/time';
import { motion } from 'framer-motion';

const sidebarItems = [
  { name: 'Home', path: '/client/home', icon: Home },
  { name: 'Explore', path: '/client/explore', icon: Search },
  { name: 'Map', path: '/client/map', icon: Map },
  { name: 'Jobs', path: '/client/jobs', icon: Briefcase },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Messages', path: '/client/messages', icon: MessageSquare },
];

const sidebarSecondary = [
  { name: 'Profile', path: '/client/profile', icon: User },
  { name: 'Settings', path: '/client/settings', icon: Settings },
  { name: 'Help', path: '/client/help', icon: HelpCircle },
];

export default function ClientLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCommunity = location.pathname.startsWith('/community');
  const isChatPage = location.pathname.startsWith('/client/chat') || location.pathname === '/client/messages';
  const isChatThread = location.pathname.startsWith('/client/chat');
  const isFullWidth = isCommunity || location.pathname === '/client/explore';
  const showRail = !isCommunity && ['/client/home', '/client/explore'].includes(location.pathname);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const unreadMessages = useUnreadCount();
  const { notifications, unreadCount } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const avatar = currentUser?.photoURL
    ? <img src={currentUser.photoURL} alt="profile" className="h-full w-full object-cover" />
    : currentUser?.email?.[0]?.toUpperCase();

  const renderSidebar = () => (
    <>
      <Link to="/client/home" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 px-6 pt-8 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hc-brand text-sm font-extrabold text-white">
          HC
        </div>
        <span className="font-display text-xl font-extrabold tracking-tight text-hc-ink">
          Handy<span className="text-hc-brand">Connect</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {sidebarItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl border-l-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'border-hc-brand bg-white text-hc-ink shadow-sm'
                  : 'border-transparent text-gray-600 hover:bg-white/70 hover:text-hc-ink'
              }`}
            >
              <item.icon
                size={20}
                className={active ? 'text-hc-brand' : 'text-gray-400 group-hover:text-hc-brand'}
              />
              <span className="flex-1">{item.name}</span>
              {item.name === 'Messages' && unreadMessages > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-hc-brand px-1.5 text-[10px] font-bold text-white">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-3 border-t border-hc-hairline" />

        {sidebarSecondary.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              className={`group flex min-h-11 items-center gap-3 rounded-xl border-l-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'border-hc-brand bg-white text-hc-ink shadow-sm'
                  : 'border-transparent text-gray-600 hover:bg-white/70 hover:text-hc-ink'
              }`}
            >
              <item.icon
                size={20}
                className={active ? 'text-hc-brand' : 'text-gray-400 group-hover:text-hc-brand'}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-hc-hairline px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-400 text-sm font-bold text-white">
              {avatar}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-hc-tile bg-green-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-hc-ink">{currentUser?.displayName || currentUser?.email}</p>
            <p className="text-xs text-hc-ink-2">Client</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen justify-center bg-hc-page font-sans text-hc-ink">
      <div className="flex w-full max-w-[1500px]">
        {/* Sidebar (Desktop >=1024px) — 280px */}
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-hc-hairline bg-hc-tile lg:flex">
          {renderSidebar()}
        </aside>

        {/* Sidebar drawer (Tablet 768-1023px) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto border-r border-hc-hairline bg-hc-tile shadow-xl">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-100"
              >
                <X size={20} />
              </button>
              {renderSidebar()}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex min-w-0 flex-1 flex-col bg-white md:pb-0 lg:h-screen lg:overflow-y-auto ${isChatPage ? 'pb-0' : 'pb-[calc(6rem+env(safe-area-inset-bottom))]'}`}>
          {/* Top Bar (Tablet 768-1023px) */}
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-hc-hairline bg-white/80 px-4 py-3 backdrop-blur-md md:flex lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
            >
              <Menu size={22} />
            </button>
            <Link to="/client/home" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hc-brand text-xs font-extrabold text-white">
                HC
              </div>
              <span className="font-display text-base font-extrabold tracking-tight text-hc-ink">
                Handy<span className="text-hc-brand">Connect</span>
              </span>
            </Link>
            <div className="flex-1" />
            <button
              aria-label="Messages"
              onClick={() => navigate('/client/messages')}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            >
              <MessageSquare size={20} className="text-hc-ink-2" />
              {!!unreadMessages && (
                <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hc-brand px-1 text-[9px] font-bold text-white">
                  {unreadMessages}
                </span>
              )}
            </button>
          </div>

          {/* Top Bar (Desktop >=1024px) */}
          <div className="sticky top-0 z-30 hidden border-b border-hc-hairline bg-white/80 backdrop-blur-md lg:flex items-center justify-between gap-4 px-8 py-4">
            <div className="flex-1" />

            <button className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-hc-ink-2 transition-colors hover:bg-gray-200">
              <MapPin size={16} className="text-hc-ink-3" /> Harare, Zimbabwe
            </button>

            <div className="flex items-center gap-2">
              <button
                aria-label="Messages"
                onClick={() => navigate('/client/messages')}
                className="relative rounded-full bg-gray-100 p-2.5 transition-colors hover:bg-gray-200"
              >
                <MessageSquare size={18} className="text-hc-ink-2" />
                {!!unreadMessages && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hc-brand px-1 text-[9px] font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </button>

              <div className="relative" ref={notifRef}>
                <button
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative rounded-full bg-gray-100 p-2.5 transition-colors hover:bg-gray-200"
                >
                  <Bell size={18} className="text-hc-ink-2" />
                  {!!unreadCount && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hc-brand px-1 text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-hc-hairline bg-white py-3 shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-hc-hairline">
                      <p className="text-xs font-bold text-hc-ink">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={() => markAllNotificationsRead(currentUser.uid)} className="text-[10px] font-semibold text-hc-brand hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="px-2 pt-2 space-y-1 max-h-80 overflow-y-auto">
                      {!notifications.length && (
                        <p className="py-6 text-center text-xs text-hc-ink-3">No notifications yet</p>
                      )}
                      {notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => { markNotificationRead(n.id); setNotifOpen(false); }}
                          className={`flex items-start gap-2 rounded-xl px-3 py-2.5 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-hc-tile' : ''}`}
                        >
                          <div className={`h-2 w-2 mt-1 shrink-0 rounded-full ${n.read ? 'bg-hc-hairline' : 'bg-hc-brand'}`} />
                          <div className="min-w-0">
                            <p className="text-sm text-hc-ink-2">{n.data?.text || n.type}</p>
                            <p className="text-[10px] text-hc-ink-3">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setNotifOpen(false)} className="mt-2 w-full text-center text-xs font-semibold text-hc-ink-2 py-2 hover:bg-gray-50 rounded-b-xl">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1 transition-colors hover:bg-gray-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-xs font-bold text-white">
                    {avatar}
                  </div>
                  <ChevronDown size={14} className={`text-hc-ink-3 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-hc-hairline bg-white py-2 shadow-lg z-50">
                    <Link to="/client/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-hc-ink-2 hover:bg-gray-50">
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/client/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-hc-ink-2 hover:bg-gray-50">
                      <Settings size={16} /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Content + Right Sidebar */}
          <div className={`flex gap-6 px-4 lg:px-8 ${isChatPage ? 'py-0' : 'py-6 lg:py-8'}`}>
            <div className={`min-w-0 flex-1 mx-auto lg:mx-0 ${isFullWidth ? 'max-w-none' : 'max-w-[820px]'}`}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </div>

            {/* Right Sidebar (Desktop) — Home, Explore, Jobs only */}
            {showRail && (
              <aside className="sticky top-24 hidden w-[300px] shrink-0 self-start lg:flex flex-col divide-y divide-black/[0.06] rounded-2xl border border-black/[0.05] bg-[#FAFAFA] p-4">
                <NotificationsPreview />
                <RailUpcomingJobs />
                <WalletCard />
                <RailRecentMessages />
                <RailWeeklySummary />
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (<768px) */}
      {!isChatThread && <MobileBottomNav />}
    </div>
  );
}
