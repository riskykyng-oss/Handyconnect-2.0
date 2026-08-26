import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, UserCircle } from 'lucide-react';

export default function BottomNav({ role }) {
  const location = useLocation();
  
  // Define items based on role
  const items = role === 'client' 
    ? [
        { name: 'Home', path: '/client/home', icon: LayoutDashboard },
        { name: 'Community', path: '/community', icon: Users },
      ]
    : [
        { name: 'Find Work', path: '/handyman/jobs', icon: Briefcase },
        { name: 'My Jobs', path: '/handyman/my-jobs', icon: LayoutDashboard },
        { name: 'Community', path: '/community', icon: Users },
        { name: 'Profile', path: '/handyman/profile', icon: UserCircle },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-hc-surface border-t border-hc-hairline z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? 'text-hc-brand' : 'text-hc-ink-3 hover:text-hc-ink-2'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-hc-brand' : ''}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}