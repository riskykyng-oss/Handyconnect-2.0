import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Briefcase, ArrowRight, MapPin,
  ChevronRight, Star, Clock, Shield, MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeProfessionals } from '@/services/userService';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import useClientJobs from '@/hooks/useClientJobs';
import HeroSection from '../components/HeroSection';
import QuickActionCard from '../components/QuickActionCard';
import NearbyMapSection from '../components/NearbyMapSection';
import CommunityPreview from '../components/CommunityPreview';
import PostJobModal from '../components/PostJobModal';
import { quickActions } from '@/constants/quickActions';

const prosFromUsers = (users) =>
  users.map((u) => ({
    id: u.id,
    name: u.displayName || u.email || 'Handyman',
    role: u.trade || (u.skills && u.skills.split(',')[0]) || 'Handyman',
    rating: typeof u.rating === 'number' ? u.rating : 5,
    jobs: u.jobs || 0,
    image: u.photoURL || null,
  }));

function timeAgo(date) {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function SectionHeader({ title, action, actionLabel }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-lg font-extrabold text-gray-900">{title}</h2>
      {action && (
        <button onClick={action} className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
          {actionLabel || 'See all'} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

export default function ClientHomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { jobs, loading: loadingJobs, postJob } = useClientJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pros, setPros] = useState([]);

  useEffect(() => subscribeProfessionals((users) => setPros(users.filter((u) => u.id !== currentUser?.uid))), [currentUser]);

  const topPros = prosFromUsers(pros).slice(0, 8);

  useEffect(() => {
    if (searchParams.get('post') === '1') {
      const id = requestAnimationFrame(() => setIsModalOpen(true));
      return () => cancelAnimationFrame(id);
    }
  }, [searchParams]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const name = currentUser?.displayName?.split(' ')[0] || 'There';

  const handleSaveJob = async (jobData) => {
    await postJob(jobData);
  };

  return (
    <div className="space-y-10 pb-24 lg:pb-0">
      {/* Mobile Header */}
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <p className="text-xs font-medium text-gray-500">{greeting}</p>
          <h1 className="font-display text-xl font-extrabold tracking-tight text-gray-900">{name}</h1>
        </div>
        <button className="relative rounded-full bg-white p-2.5 shadow-sm border border-gray-200">
          <Briefcase size={18} className="text-gray-700" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>
      </div>

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Quick Actions */}
      <div>
        <div className="mb-4">
          <h2 className="font-display text-lg font-extrabold text-gray-900">Quick Actions</h2>
          <p className="mt-0.5 text-sm text-gray-500">Everything you need is one tap away.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickActions.map((action, i) => (
            <QuickActionCard
              key={action.id}
              action={action}
              index={i}
              onClick={() => {
                if (action.action === 'postJob') {
                  setIsModalOpen(true);
                } else {
                  navigate(action.route);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* 3. Map Section */}
      <div>
        <NearbyMapSection />
      </div>

      {/* 4. Professional Carousel */}
      <div>
        <SectionHeader title="Top Professionals" actionLabel="Find more" action={() => navigate('/client/explore')} />
        {topPros.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No professionals yet</p>
            <p className="mt-1 text-xs text-gray-400">Professionals who sign up will appear here.</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {topPros.map((pro) => (
              <motion.div
                key={pro.id}
                whileHover={{ y: -2 }}
                onClick={() => navigate('/client/explore')}
                className="flex shrink-0 flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm border border-gray-200 w-[150px]"
              >
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-orange-200">
                  {pro.image ? (
                    <img src={pro.image} alt={pro.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-orange-100 text-sm font-bold text-orange-700">
                      {pro.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{pro.name}</p>
                  <p className="text-xs text-gray-500">{pro.role}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-900">{pro.rating}</span>
                  <span className="text-gray-400">({pro.jobs})</span>
                </div>
                <button className="w-full rounded-xl bg-orange-500 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600">
                  Hire
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Job Feed */}
      <div>
        <SectionHeader title="Active Jobs" actionLabel={jobs.length > 0 ? 'View all' : undefined} action={jobs.length > 0 ? () => navigate('/client/jobs') : undefined} />
        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <JobCardSkeleton /><JobCardSkeleton />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No active jobs</p>
            <p className="mt-1 text-xs text-gray-400">Post your first job to get started.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-600">
              <Plus size={14} /> Post a Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-gray-900">{job.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400" /> {job.location || 'Your area'}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'assigned' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {job.status === 'assigned' ? 'In Progress' : 'Open'}
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" /> {timeAgo(job.createdAt?.toDate ? job.createdAt.toDate() : job.createdAt)}
                  </span>
                  <span className="font-semibold text-gray-900">${job.budget}</span>
                </div>

                {job.status === 'assigned' && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
                      {job.handymanName?.[0] || 'H'}
                    </div>
                    <p className="flex-1 text-xs font-semibold text-gray-900">{job.handymanName || 'Professional'}</p>
                    <MessageCircle size={14} className="text-orange-500" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-emerald-500" />
                    <span className="text-[11px] text-emerald-600 font-semibold">Verified</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-bold text-orange-500 transition-colors hover:text-orange-600">
                    View Progress <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Community Preview */}
      <div>
        <CommunityPreview compact />
      </div>

      <PostJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveJob} />
    </div>
  );
}
