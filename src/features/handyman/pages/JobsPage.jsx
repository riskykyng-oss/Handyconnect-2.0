import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { JobCardSkeleton } from '@/components/ui/Skeleton'; // Imported Skeleton
import { getOpenJobs, acceptJob } from '@/services/jobService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { MapPin, DollarSign, X } from 'lucide-react';

export default function JobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [accepting, setAccepting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const openJobs = await getOpenJobs();
      setJobs(openJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async () => {
    if (!selectedJob || !currentUser) return;
    setAccepting(true);
    try {
      const handymanName = currentUser.displayName || currentUser.email;
      await acceptJob(selectedJob.id, currentUser.uid, handymanName);
      
      setSelectedJob(null);
      await fetchJobs();
    } catch (error) {
      console.error("Error accepting job:", error);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
        <p className="text-gray-500 mt-2">Browse open requests from clients in your area.</p>
      </div>

      {loading ? (
        // NEW: Show 4 skeleton cards while loading from Firebase
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">No open jobs right now. Check back soon!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <span className="flex items-center font-bold text-orange-500 text-lg">
                    <DollarSign size={18} />
                    {job.budget}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 line-clamp-2">{job.description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <span className="flex items-center text-sm text-gray-500 gap-1">
                  <MapPin size={16} /> Remote
                </span>
                <Button onClick={() => setSelectedJob(job)}>View Details</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 z-40" onClick={() => setSelectedJob(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-xl font-bold text-orange-500">
                <DollarSign size={20} /> {selectedJob.budget}
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button className="flex-1" onClick={handleAcceptJob} disabled={accepting}>
                {accepting ? 'Accepting...' : 'Accept Job'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}