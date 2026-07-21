import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import JobCard from '@/components/cards/JobCard';
import PostCard from '@/components/cards/PostCard';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createJob, getClientJobs } from '@/services/jobService';
import PostJobModal from '../components/PostJobModal';
import { Wrench, Search, ClipboardList, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TODO: replace with a real fetch from postService once you have a
// getFeedPosts()-style function — placeholder so the feed layout has
// something to render.
const PLACEHOLDER_POSTS = [];

// TODO: replace with a real fetch (e.g. userService.getSuggestedHandymen())
const PLACEHOLDER_SUGGESTED = [];

// TODO: replace with a real fetch for open jobs from other clients
const PLACEHOLDER_NEARBY_JOBS = [];

const FEED_TABS = ['For you', 'Following', 'Trending'];

export default function ClientHomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeTab, setActiveTab] = useState('For you');

  useEffect(() => {
    const fetchJobs = async () => {
      if (currentUser) {
        try {
          const clientJobs = await getClientJobs(currentUser.uid);
          setJobs(clientJobs);
        } catch (error) {
          console.error('Error fetching jobs:', error);
        } finally {
          setLoadingJobs(false);
        }
      }
    };
    fetchJobs();
  }, [currentUser]);

  const handleSaveJob = async (jobData) => {
    await createJob(jobData, currentUser.uid);
    const updatedJobs = await getClientJobs(currentUser.uid);
    setJobs(updatedJobs);
  };

  const activeJobsCount = jobs.filter((job) => job.status === 'open').length;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 font-sans text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Center column */}
      <div className="min-w-0">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">
              Welcome back, {currentUser?.displayName?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-gray-500 mt-1">Manage your projects and find trusted handymen.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="hidden md:flex rounded-full bg-[#F97316] hover:bg-orange-600 border-0 shadow-lg shadow-orange-500/20">
            <Plus size={18} className="mr-2" /> Post job
          </Button>
        </div>

        {/* CTA banner - Deep Dark Slate */}
        <Card className="bg-slate-900 text-white border-0 mb-6 rounded-3xl shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-bold text-xl md:text-2xl mb-2">Need something fixed?</h2>
              <p className="text-slate-400">Post a job and get quotes from verified handymen in minutes.</p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#F97316] hover:bg-orange-600 text-white border-0 rounded-full whitespace-nowrap shadow-lg shadow-orange-500/30"
            >
              Post a new job
            </Button>
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="flex flex-col items-center text-center rounded-2xl py-6 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <ClipboardList className="text-[#F97316]" size={20} />
            </div>
            <h3 className="font-display font-extrabold text-xl text-gray-900">{activeJobsCount}</h3>
            <p className="text-gray-400 text-xs mt-0.5">Active jobs</p>
          </Card>
          <Card className="flex flex-col items-center text-center rounded-2xl py-6 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <Wrench className="text-[#F97316]" size={20} />
            </div>
            <h3 className="font-display font-extrabold text-xl text-gray-900">0</h3>
            <p className="text-gray-400 text-xs mt-0.5">Hired handymen</p>
          </Card>
          <Card className="flex flex-col items-center text-center rounded-2xl py-6 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <Search className="text-[#F97316]" size={20} />
            </div>
            <h3 className="font-display font-extrabold text-xl text-gray-900">0</h3>
            <p className="text-gray-400 text-xs mt-0.5">Saved pros</p>
          </Card>
        </div>

        {/* Story row */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-dashed border-[#F97316]/40 flex items-center justify-center">
              <Plus size={20} className="text-[#F97316]" />
            </div>
            <span className="text-xs text-gray-500">Your story</span>
          </div>
          {PLACEHOLDER_SUGGESTED.slice(0, 5).map((pro) => (
            <div key={pro.id} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-[#F97316]/30 overflow-hidden">
                {pro.photoUrl && <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" />}
              </div>
              <span className="text-xs text-gray-500 max-w-[64px] truncate">{pro.name}</span>
            </div>
          ))}
        </div>

        {/* Feed tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
          {FEED_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab ? 'border-[#F97316] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed: posts (once wired up) */}
        {PLACEHOLDER_POSTS.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUser?.uid} onLike={() => {}} />
        ))}

        {/* Your jobs */}
        <h3 className="font-display font-bold text-lg mb-4 text-gray-900">Recent jobs</h3>
        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="rounded-2xl">
            <p className="text-gray-400 text-center py-8">No jobs posted yet. Click "Post a new job" to get started!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isClient={true} onMessage={() => navigate(`/chat/${job.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Right rail */}
      <div className="hidden lg:block space-y-6">
        <Card className="rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-gray-900">Suggested handymen</h3>
            <button className="text-xs font-semibold text-[#F97316] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {PLACEHOLDER_SUGGESTED.length === 0 ? (
            <p className="text-xs text-gray-400">No suggestions yet.</p>
          ) : (
            <div className="space-y-4">
              {PLACEHOLDER_SUGGESTED.map((pro) => (
                <div key={pro.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                    {pro.photoUrl && <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-gray-900">{pro.name}</p>
                    <p className="text-xs text-gray-400 truncate">{pro.skill} · {pro.rating}★</p>
                  </div>
                  <button className="text-xs font-semibold text-[#F97316] border border-[#F97316]/30 rounded-full px-3 py-1 hover:bg-orange-50 transition-colors">
                    Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-gray-900">Jobs near you</h3>
            <button className="text-xs font-semibold text-[#F97316] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {PLACEHOLDER_NEARBY_JOBS.length === 0 ? (
            <p className="text-xs text-gray-400">Nothing nearby right now.</p>
          ) : (
            <div className="space-y-4">
              {PLACEHOLDER_NEARBY_JOBS.map((j) => (
                <div key={j.id}>
                  <p className="text-sm font-semibold text-gray-900">{j.title}</p>
                  <p className="text-xs text-gray-400">{j.location}</p>
                  <p className="text-xs font-semibold text-[#F97316] mt-0.5">${j.budgetMin} - ${j.budgetMax}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <PostJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveJob} />
    </div>
  );
}