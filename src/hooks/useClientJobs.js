import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getClientJobs, createJob } from '@/services/jobService';

export default function useClientJobs() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!currentUser) {
      setJobs([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getClientJobs(currentUser.uid);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetch(); }, [fetch]);

  const postJob = async (jobData) => {
    await createJob(jobData, currentUser.uid);
    await fetch();
  };

  return { jobs, loading, postJob, refetch: fetch };
}
