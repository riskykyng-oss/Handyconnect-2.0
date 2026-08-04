import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeProfessionals } from '@/services/userService';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import useClientJobs from '@/hooks/useClientJobs';
import { JOB_CATEGORIES } from '@/constants/categories';
import DashboardHero from '../components/DashboardHero';
import QuickActionTile from '../components/QuickActionTile';
import ProCard from '../components/ProCard';
import JobCard from '../components/JobCard';
import CommunityPreview from '../components/CommunityPreview';
import PostJobModal from '../components/PostJobModal';
import { SectionHeader } from '../components/DashboardUI';
import { quickActions } from '@/constants/quickActions';

const prosFromUsers = (users) =>
  users.map((u) => ({
    id: u.id,
    name: u.displayName || u.email || 'Handyman',
    role: u.trade || (u.skills && u.skills.split(',')[0]) || 'Handyman',
    rating: typeof u.rating === 'number' ? u.rating : null,
    jobs: u.jobs || 0,
    rate: typeof u.hourlyRate === 'number' ? u.hourlyRate : null,
    verified: !!u.verified,
  }));

export default function ClientHomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, loading: loadingJobs, postJob } = useClientJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pros, setPros] = useState([]);

  useEffect(() => subscribeProfessionals((users) => setPros(users.filter((u) => u.id !== currentUser?.uid))), [currentUser]);

  const topPros = prosFromUsers(pros).slice(0, 8);

  useEffect(() => {
    if (searchParams.get('post') === '1') {
      const id = requestAnimationFrame(() => {
        setIsModalOpen(true);
        setSearchParams({}, { replace: true });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [searchParams, setSearchParams]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const name = currentUser?.displayName?.split(' ')[0] || 'There';

  const handleSaveJob = async (jobData) => {
    await postJob(jobData);
  };

  const openJob = (job) => navigate(job.status === 'assigned' ? `/client/chat/${job.id}` : '/client/jobs');

  return (
    <>
      <div className="space-y-8 divide-y divide-black/[0.07] pb-20 lg:space-y-10 lg:pb-0">
        <DashboardHero greeting={greeting} name={name} stats={{ pros: pros.length, nearby: jobs.length }} />

        {/* Quick Actions */}
        <section aria-label="Quick actions">
          <SectionHeader title="Quick Actions" />
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {quickActions.map((action, i) => (
              <QuickActionTile
                key={action.id}
                action={action}
                index={i}
                onPress={() => {
                  if (action.action === 'postJob') {
                    setIsModalOpen(true);
                  } else {
                    navigate(action.route);
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* Recommended Professionals */}
        <section aria-label="Recommended professionals">
          <SectionHeader title="Recommended Professionals" actionLabel="Find more" onAction={() => navigate('/client/explore')} />
          {topPros.length === 0 ? (
            <div className="rounded-xl border border-dashed border-hc-hairline bg-white p-10 text-center shadow-sm">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <Briefcase size={26} />
              </span>
              <p className="text-[15px] font-medium text-hc-ink-2">No professionals yet</p>
              <p className="mt-1 text-[13px] text-hc-caption">Professionals who sign up will appear here.</p>
            </div>
          ) : (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
              {topPros.map((pro) => (
                <ProCard key={pro.id} pro={pro} onHire={() => setIsModalOpen(true)} />
              ))}
            </div>
          )}
        </section>

        {/* Active Jobs */}
        <section aria-label="Active jobs">
          <SectionHeader
            title="Active Jobs"
            actionLabel={jobs.length > 0 ? 'View all' : undefined}
            onAction={jobs.length > 0 ? () => navigate('/client/jobs') : undefined}
          />
          {loadingJobs ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-hc-hairline bg-white p-10 text-center shadow-sm">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <Briefcase size={26} />
              </span>
              <p className="text-[15px] font-medium text-hc-ink-2">No active jobs</p>
              <p className="mt-1 text-[13px] text-hc-caption">Post your first job to get started.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-hc-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
              >
                <Plus size={15} /> Post a Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {jobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} onOpen={() => openJob(job)} />
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section aria-label="Categories">
          <SectionHeader title="Categories" actionLabel="Browse all" onAction={() => navigate('/client/explore')} />
          <div className="flex flex-wrap gap-2">
            {JOB_CATEGORIES.slice(0, 8).map((category) => (
              <button
                key={category}
                onClick={() => navigate(`/client/explore?q=${encodeURIComponent(category)}`)}
                className="rounded-full border border-black/[0.07] bg-white px-4 py-2 text-sm font-medium text-hc-ink shadow-sm transition-colors hover:border-hc-brand hover:bg-hc-tint hover:text-hc-brand"
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Community Highlights */}
        <CommunityPreview />
      </div>

      <PostJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveJob} />
    </>
  );
}
