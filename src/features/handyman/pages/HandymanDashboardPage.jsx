import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, CircleDollarSign, Clock3,
  MapPin, Star,
  Users, Wallet, Wrench, Sparkles, Bell, Briefcase, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAssignedJobs, getOpenJobs } from '@/services/jobService';
import HandymanHero from '../components/HandymanHero';

function SectionHeader({ title, subtitle, actionLabel, to }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-gray-900">{title}</h2>
        {actionLabel && (
          <Link to={to} className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
            {actionLabel} <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function HandymanDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      try {
        const [assigned, open] = await Promise.all([getAssignedJobs(currentUser.uid), getOpenJobs()]);
        setJobs(assigned);
        setNearby(open.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const name = currentUser?.displayName?.split(' ')[0] || 'There';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-24 pt-5 lg:pb-10">
      {/* Mobile Header */}
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <p className="text-xs font-medium text-gray-500">{greeting}</p>
          <h1 className="font-display text-xl font-extrabold tracking-tight text-gray-900">{name}</h1>
        </div>
        <button className="relative rounded-full bg-white p-2.5 shadow-sm border border-gray-200">
          <Bell size={18} className="text-gray-700" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>
      </div>

      {/* Hero Section */}
      <HandymanHero name={name} available={available} onToggle={() => setAvailable(!available)} />

      {/* Stats */}
      <div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: CircleDollarSign, label: 'Earnings', value: '$0', to: '/handyman/wallet' },
            { icon: Wrench, label: 'Active Jobs', value: String(jobs.length), to: '/handyman/my-jobs' },
            { icon: Star, label: 'Rating', value: 'New', to: '/handyman/profile' },
            { icon: Users, label: 'Profile Views', value: '0', to: '/handyman/profile' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={s.label}
                whileHover={{ y: -2 }}
                onClick={() => navigate(s.to)}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md text-left"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Icon size={18} />
                </div>
                <p className="font-display text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Nearby Jobs */}
      <div>
        <SectionHeader title="Nearby Jobs" subtitle="Open requests you could take today" actionLabel="Browse all" to="/handyman/jobs" />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse" />
            <div className="h-32 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse" />
          </div>
        ) : nearby.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearby.map((job) => (
              <motion.button
                key={job.id}
                whileHover={{ y: -2 }}
                onClick={() => navigate('/handyman/jobs')}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md text-left"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-gray-900">{job.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400" /> Nearby
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                    ${job.budget}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[11px] text-gray-400">Posted today</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                    View Details <ArrowRight size={12} />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Clock3 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No nearby jobs yet</p>
            <p className="mt-1 text-xs text-gray-400">Keep your availability on to get matched.</p>
          </div>
        )}
      </div>

      {/* Active Work */}
      <div>
        <SectionHeader title="Active Work" subtitle={jobs.length ? 'Jobs you have accepted' : undefined} actionLabel={jobs.length ? 'View all' : undefined} to="/handyman/my-jobs" />
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No active jobs</p>
            <p className="mt-1 text-xs text-gray-400">Accept a job from nearby opportunities to get started.</p>
            <button onClick={() => navigate('/handyman/jobs')} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-600">
              <Briefcase size={14} /> Find Work
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map((job) => (
              <motion.button
                key={job.id}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/handyman/chat/${job.id}`)}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md text-left"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-gray-900">{job.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400" /> {job.location || 'Client area'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[11px] text-gray-400">{job.budget ? `$${job.budget}` : 'Agreed price'}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                    Chat with client <ArrowRight size={12} />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Strength + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile strength */}
        <div>
          <SectionHeader title="Profile Strength" />
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl font-extrabold text-gray-900">35%</p>
              <span className="text-xs font-bold text-orange-500">Getting started</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '35%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-orange-500"
              />
            </div>
            <p className="mt-3 text-xs text-gray-400">Add photos, bio and skills to stand out to clients.</p>
          </div>
        </div>

        {/* Wallet preview */}
        <div>
          <SectionHeader title="Wallet" />
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Available balance</p>
                <p className="mt-0.5 font-display text-3xl font-extrabold text-gray-900">$0.00</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Wallet size={22} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">$0</p>
                  <p className="text-[10px] text-gray-500">Pending</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">$0</p>
                  <p className="text-[10px] text-gray-500">Earned</p>
                </div>
              </div>
              <button onClick={() => navigate('/handyman/wallet')} className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600">
                Details <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started */}
      <div>
        <SectionHeader title="Get Started" subtitle="Set up your profile to win more jobs" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Verify ID', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Add Photos', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Join Community', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md flex flex-col items-center gap-3"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon size={20} />
                </span>
                <span className="text-sm font-bold text-gray-900">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-orange-500" />
        <div>
          <p className="text-sm font-bold text-gray-900">Keep your availability on</p>
          <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">This helps you receive job matches in real-time and grow your earnings faster.</p>
        </div>
      </div>
    </div>
  );
}
