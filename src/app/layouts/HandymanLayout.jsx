import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Briefcase, ClipboardCheck, Wallet, Users, UserCircle, LogOut, Menu, X, Search, Bell
} from 'lucide-react';
import BottomNav from '@/components/navigation/BottomNav';

export default function HandymanLayout() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const menuItems = [
    { name: 'Find Work', path: '/handyman/jobs', icon: Briefcase },
    { name: 'My Jobs', path: '/handyman/my-jobs', icon: ClipboardCheck },
    { name: 'Wallet', path: '/handyman/wallet', icon: Wallet },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Profile', path: '/handyman/profile', icon: UserCircle }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Deep Dark Slate */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-white z-40 transform transition-transform duration-300 flex-shrink-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          <span className="font-display font-extrabold text-xl">
            Handy<span className="text-[#F97316]">Connect</span>
          </span>
          <button className="md:hidden text-white/70" onClick={() => setSidebarOpen(false)}><X size={22} /></button>
        </div>

        <nav className="mt-4 px-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-[#F97316] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={19} />
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center font-bold text-sm flex-shrink-0">
              {currentUser?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{currentUser?.displayName || currentUser?.email}</p>
              <p className="text-xs text-slate-500 capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0">
        {/* Top bar - Clean White Glassmorphism */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center gap-4">
          <button className="md:hidden text-gray-900" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md bg-slate-100 rounded-full px-4 py-2.5">
            <Search size={17} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search for jobs, services..."
              className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <span className="md:hidden font-display font-extrabold text-lg flex-1 text-center text-gray-900">
            Handy<span className="text-[#F97316]">Connect</span>
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <Link to="/handyman/my-jobs" className="relative w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
              <Bell size={19} className="text-gray-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full" />
            </Link>
            <Link to="/handyman/profile" className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-sm text-[#F97316] flex-shrink-0">
              {currentUser?.email?.[0]?.toUpperCase()}
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav role={userRole} />
    </div>
  );
}