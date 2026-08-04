import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import useUnreadCount from '@/hooks/useUnreadCount';

const isActive = (path, location) => {
  if (path === '/client/home') return location.pathname === '/client/home';
  if (path === '/client/explore') return location.pathname === '/client/explore' || location.pathname === '/client/map';
  if (path === '/client/messages') return location.pathname.startsWith('/client/messages') || location.pathname.startsWith('/client/chat');
  return location.pathname === path;
};

function NavLink({ item, location }) {
  const active = isActive(item.path, location);
  return (
    <Link
      to={item.path}
      aria-current={active ? 'page' : undefined}
      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg text-hc-ink-3 transition-colors hover:text-hc-ink active:scale-95"
    >
      <span className={`relative ${active ? 'text-hc-brand' : ''}`}>
        <item.icon size={22} strokeWidth={active ? 2.4 : 2} />
        {item.badge && item.badge > 0 && (
          <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hc-brand px-1 text-[9px] font-bold text-white">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </span>
      <span className={`text-[10px] font-medium ${active ? 'text-hc-brand' : ''}`}>{item.name}</span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadMessages = useUnreadCount();

  const left = [
    { name: 'Home', path: '/client/home', icon: Home },
    { name: 'Explore', path: '/client/explore', icon: Search },
  ];
  const right = [
    { name: 'Messages', path: '/client/messages', icon: MessageSquare, badge: unreadMessages },
    { name: 'Profile', path: '/client/profile', icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-hc-hairline bg-[#ECEDEF]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Bottom navigation">
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-between px-2">
        {left.map((item) => (
          <NavLink key={item.path} item={item} location={location} />
        ))}

        <div className="flex w-16 items-start justify-center">
          <button
            onClick={() => navigate('/client/home?post=1')}
            aria-label="Post a job"
            className="-mt-4 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-hc-brand text-white shadow-lg shadow-hc-brand/30 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={24} strokeWidth={2.5} />
            <span className="text-[9px] font-semibold">Post</span>
          </button>
        </div>

        {right.map((item) => (
          <NavLink key={item.path} item={item} location={location} />
        ))}
      </div>
    </nav>
  );
}
