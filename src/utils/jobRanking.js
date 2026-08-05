import { haversineKm } from '@/utils/distance';

const CATEGORY_KEYWORDS = {
  plumbing: ['plumb', 'pipe', 'tap', 'leak', 'drain', 'toilet', 'water', 'burst'],
  electrical: ['electric', 'electr', 'wiring', 'socket', 'power', 'light', 'fuse', 'spark'],
  cleaning: ['clean', 'cleaner', 'housekeep', 'domestic', 'tidy', 'maid'],
  carpentry: ['carpent', 'wood', 'furniture', 'joiner', 'cabinet', 'shelf'],
  painting: ['paint', 'painter', 'decorat', 'repaint'],
  landscaping: ['garden', 'landscap', 'lawn', 'yard'],
  welding: ['weld', 'metal', 'steel'],
  roofing: ['roof', 'gutter'],
};

const jobPosition = (job) => {
  if (job && job.lat != null && job.lng != null) return { lat: job.lat, lng: job.lng };
  if (job?.location && job.location.lat != null && job.location.lng != null) return job.location;
  return null;
};

export const tradeMatches = (job, profile) => {
  const skills = `${profile?.trade || ''} ${profile?.skills || ''}`.toLowerCase();
  if (!skills.trim()) return false;
  const jobText = `${job?.category || ''} ${job?.title || ''} ${job?.description || ''}`.toLowerCase();
  const jobWords = new Set(jobText.split(/[^a-z]+/).filter(Boolean));
  const proCategories = Object.keys(CATEGORY_KEYWORDS).filter((cat) =>
    CATEGORY_KEYWORDS[cat].some((w) => skills.includes(w))
  );
  if (!proCategories.length) return false;
  return proCategories.some((cat) => CATEGORY_KEYWORDS[cat].some((w) => jobWords.has(w)));
};

export const scoreJob = (job, profile) => {
  let score = 0;
  let km = null;

  if (job.handymanId) score += 100;
  if (tradeMatches(job, profile)) score += 50;
  if (job.urgent) score += 5;

  const proPos = profile?.location;
  const jobPos = jobPosition(job);
  if (proPos?.lat != null && proPos?.lng != null && jobPos) {
    km = haversineKm(proPos, jobPos);
    if (km == null) {
      score += 2;
    } else if (km <= 5) {
      score += 40;
    } else if (km <= 15) {
      score += 25;
    } else if (km <= 30) {
      score += 10;
    } else {
      score += 2;
    }
  } else if (job?.location) {
    score += 5;
  }

  return { score, km };
};

export const rankJobsForHandyman = (jobs, profile) =>
  (jobs || [])
    .map((job) => ({ job, ...scoreJob(job, profile) }))
    .sort((a, b) => b.score - a.score || (a.km ?? Infinity) - (b.km ?? Infinity));
