import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Users, Briefcase, CheckCircle, Loader2, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, assignedJobs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const jobsSnapshot = await getDocs(collection(db, 'jobs'));
        
        let assignedCount = 0;
        jobsSnapshot.forEach(doc => {
          if (doc.data().status === 'assigned' || doc.data().status === 'completed') assignedCount++;
        });

        setStats({ users: usersSnapshot.size, jobs: jobsSnapshot.size, assignedJobs: assignedCount });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#F97316]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 mb-8 flex justify-between items-center text-white shadow-lg">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">Platform Overview</h1>
          <p className="text-slate-400 mt-1">Monitor all users and jobs on HandyConnect.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-semibold text-[#F97316]">
          <TrendingUp size={16} /> Live Data
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="text-[#F97316]" size={24} />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <h3 className="font-display font-extrabold text-3xl text-gray-900">{stats.users}</h3>
          <p className="text-gray-500 text-sm mt-1">Total Users</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Briefcase className="text-[#F97316]" size={24} />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">All Time</span>
          </div>
          <h3 className="font-display font-extrabold text-3xl text-gray-900">{stats.jobs}</h3>
          <p className="text-gray-500 text-sm mt-1">Total Jobs Posted</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-[#F97316]" size={24} />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">In Progress</span>
          </div>
          <h3 className="font-display font-extrabold text-3xl text-gray-900">{stats.assignedJobs}</h3>
          <p className="text-gray-500 text-sm mt-1">Active Assignments</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-display font-bold text-xl mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {/* Dummy data for visual polish */}
          <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">D</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Dylan posted a new job</p>
              <p className="text-xs text-gray-400">Fix kitchen sink leak · $50</p>
            </div>
            <span className="text-xs text-gray-400">2m ago</span>
          </div>
          <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-sm">T</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Tendai accepted a job</p>
              <p className="text-xs text-gray-400">Bathroom plumbing · $120</p>
            </div>
            <span className="text-xs text-gray-400">1h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}