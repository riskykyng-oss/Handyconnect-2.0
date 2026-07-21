import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import JobCard from '@/components/cards/JobCard';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAssignedJobs } from '@/services/jobService';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function MyJobsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (currentUser) {
        try {
          const assignedJobs = await getAssignedJobs(currentUser.uid);
          setJobs(assignedJobs);
        } catch (error) {
          console.error("Error fetching assigned jobs:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchJobs();
  }, [currentUser]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Active Jobs</h1>
        <p className="text-gray-500 mt-2">Jobs you have accepted. Chat with the client here.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">You haven't accepted any jobs yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              // Notice the URL is /handyman/chat/ for the handyman!
              onMessage={() => navigate(`/handyman/chat/${job.id}`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}