import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Home, Search, Briefcase, MessageSquare, User, Plus, Bell,
  Wallet, Users, Settings, LogOut, MapPin, ChevronDown,
  Clock, Star, HelpCircle, Menu, X,
} from 'lucide-react';
import WalletCard from '@/features/client/components/WalletCard';
import NotificationsPreview from '@/features/client/components/NotificationsPreview';
import useUnreadCount from '@/hooks/useUnreadCount';
import useNotifications from '@/hooks/useNotifications';
import { markAllNotificationsRead, markNotificationRead } from '@/services/notificationService';
import { motion } from 'framer-motion';

const timeAgo = (date) => {
  if (!date) return '';
  const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return new Date(date).toLocaleDateString();
};

const sidebarItems = [
  { name: 'Home', path: '/client/home', icon: Home },
  { name: 'Explore', path: '/client/explore', icon: Search },
  { name: 'Jobs', path: '/client/jobs', icon: Briefcase },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Messages', path: '/client/messages', icon: MessageSquare },
];

const sidebarSecondary = [
  { name: 'Profile', path: '/client/profile', icon: User },
  { name: 'Settings', path: '/client/settings', icon: Settings },
  { name: 'Help', path: '/client/help', icon: HelpCircle },
];

const bottomNavItems = [
  { name: 'Home', path: '/client/home', icon: Home },
  { name: 'Explore', path: '/client/explore', icon: Search },
  { name: 'Post Job', path: '/client/home?post=1', icon: Plus, primary: true },
  { name: 'Messages', path: '/client/messages', icon: MessageSquare },
  { name: 'Profile', path: '/client/profile', icon: User },
];

function UpcomingJobs() {
  const navigate = useNavigate();
  const jobs = [
    { title: 'Electrical wiring', pro: 'Kuda D.', time: 'Tomorrow, 10:00 AM', amount: '$120' },
  ];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Clock size={16} className="text-orange-500" />
        <h3 className="font-display text-sm font-bold text-gray-900">Upcoming Jobs</h3>
      </div>
      <div className="space-y-3">
        {jobs.map((job, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-gray-100 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{job.title}</p>
              <p className="text-xs text-gray-500">{job.pro} &middot; {job.time}</p>
            </div>
            <span className="ml-3 whitespace-nowrap text-sm font-bold text-orange-600">{job.amount}</span>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/client/jobs')} className="mt-3 w-full rounded-xl bg-gray-100 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-200">
        View all jobs
      </button>
    </div>
  );
}

function UnreadMessages() {
  const msgs = [
    { name: 'Kuda D.', preview: 'The estimate is ready', time: '1h ago', unread: false },
  ];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare size={16} className="text-orange-500" />
        <h3 className="font-display text-sm font-bold text-gray-900">Recent Messages</h3>
      </div>
      <div className="space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={`flex items-start gap-3 rounded-xl p-2.5 ${m.unread ? 'bg-orange-50' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
              {m.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                {m.name}
                {m.unread && <span className="h-2 w-2 rounded-full bg-orange-500" />}
              </p>
              <p className="truncate text-xs text-gray-500">{m.preview}</p>
              <p className="text-[10px] text-gray-400">{m.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklySummary() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-display mb-3 text-sm font-bold text-gray-900">This Week</h3>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Jobs Done', value: '3', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Spent', value: '$215', icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Rating', value: '4.8', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-gray-100 p-3 text-center">
              <div className={`mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full ${s.bg}`}>
                <Icon size={14} className={s.color} />
              </div>
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCommunity = location.pathname.startsWith('/community');
  const showRail = !isCommunity && ['/client/home', '/client/explore', '/client/jobs'].includes(location.pathname);
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20">
          HC
        </div>
        <span className="font-display text-xl font-extrabold tracking-tight text-gray-900">
          Handy<span className="text-orange-500">Connect</span>
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
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
              }`}
            >
              <item.icon
                size={20}
                className={active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}
              />
              <span className="flex-1">{item.name}</span>
              {item.name === 'Messages' && unreadMessages > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
              {active && (
                <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
              )}
            </Link>
          );
        })}

        <div className="my-3 border-t border-gray-300/60" />

        {sidebarSecondary.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
              }`}
            >
              <item.icon
                size={20}
                className={active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-300/60 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-400 text-sm font-bold text-white">
              {avatar}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#E5E7EB] bg-green-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{currentUser?.displayName || currentUser?.email}</p>
            <p className="text-xs text-gray-500">Client</p>
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
    <div className="flex min-h-screen justify-center bg-gray-50 font-sans text-gray-900">
      <div className="flex w-full max-w-[1500px]">
        {/* Sidebar (Desktop >=1024px) — 280px */}
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col bg-[#E5E7EB] lg:flex">
          {renderSidebar()}
        </aside>

        {/* Sidebar drawer (Tablet 768-1023px) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto bg-[#E5E7EB] shadow-xl">
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
        <main className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0 lg:h-screen lg:overflow-y-auto">
          {/* Top Bar (Tablet 768-1023px) */}
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md md:flex lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
            >
              <Menu size={22} />
            </button>
            <Link to="/client/home" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-xs font-extrabold text-white">
                HC
              </div>
              <span className="font-display text-base font-extrabold tracking-tight text-gray-900">
                Handy<span className="text-orange-500">Connect</span>
              </span>
            </Link>
            <div className="flex-1" />
            <button
              aria-label="Messages"
              onClick={() => navigate('/client/messages')}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            >
              <MessageSquare size={20} className="text-gray-700" />
              {!!unreadMessages && (
                <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                  {unreadMessages}
                </span>
              )}
            </button>
          </div>

          {/* Top Bar (Desktop >=1024px) */}
          <div className="sticky top-0 z-30 hidden border-b border-gray-200 bg-white/80 backdrop-blur-md lg:flex items-center justify-between gap-4 px-8 py-4">
            <div className="relative flex-1 max-w-md">
              <input
                placeholder="Search services or pros..."
                className="w-full rounded-xl border border-gray-200 bg-gray-100 py-2.5 pl-4 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>

            <button className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200">
              <MapPin size={16} className="text-orange-500" /> Harare, Zimbabwe
            </button>

            <div className="flex items-center gap-2">
              <button
                aria-label="Messages"
                onClick={() => navigate('/client/messages')}
                className="relative rounded-full bg-gray-100 p-2.5 transition-colors hover:bg-gray-200"
              >
                <MessageSquare size={18} className="text-gray-700" />
                {!!unreadMessages && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
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
                  <Bell size={18} className="text-gray-700" />
                  {!!unreadCount && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-gray-200 bg-white py-3 shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={() => markAllNotificationsRead(currentUser.uid)} className="text-[10px] font-semibold text-orange-500 hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="px-2 pt-2 space-y-1 max-h-80 overflow-y-auto">
                      {!notifications.length && (
                        <p className="py-6 text-center text-xs text-gray-400">No notifications yet</p>
                      )}
                      {notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => { markNotificationRead(n.id); setNotifOpen(false); }}
                          className={`flex items-start gap-2 rounded-xl px-3 py-2.5 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-orange-50/50' : ''}`}
                        >
                          <div className={`h-2 w-2 mt-1 shrink-0 rounded-full ${n.read ? 'bg-gray-200' : 'bg-orange-500'}`} />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-700">{n.data?.text || n.type}</p>
                            <p className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setNotifOpen(false)} className="mt-2 w-full text-center text-xs font-semibold text-gray-500 py-2 hover:bg-gray-50 rounded-b-xl">
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
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-50">
                    <Link to="/client/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/client/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
          <div className="flex gap-6 px-4 py-6 lg:px-8 lg:py-8">
            <div className={`min-w-0 flex-1 mx-auto lg:mx-0 ${isCommunity ? 'max-w-none' : 'max-w-[820px]'}`}>
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
              <aside className="sticky top-24 hidden w-[320px] shrink-0 self-start lg:flex flex-col gap-5">
                <NotificationsPreview />
                <UpcomingJobs />
                <WalletCard />
                <UnreadMessages />
                <WeeklySummary />
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (<768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-around">
          {bottomNavItems.map((item) => {
            const active = location.pathname === item.path || (item.path.includes('?') && location.pathname + '?' + location.search.split('?')[1] === item.path);
            if (item.primary) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex h-full w-full flex-col items-center justify-center gap-0.5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 -mt-3 transition-transform hover:scale-105 active:scale-95">
                    <Plus size={24} strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-bold text-orange-500 -mt-0.5">Post</span>
                </Link>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex h-full w-full flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                {item.name === 'Messages' && unreadMessages > 0 && (
                  <span className="absolute right-[calc(50%-16px)] top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
                <span className={`text-[10px] font-semibold ${active ? 'text-orange-500' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB - Mobile (hidden since bottom nav has +) */}
    </div>
  );
}
