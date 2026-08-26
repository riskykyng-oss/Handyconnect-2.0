import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  db: {},
  mockAddDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockGetDocs: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockSetDoc: vi.fn(),
  mockDoc: vi.fn((_db, path, ...segs) => ({ path: [path, ...segs].join('/') })),
  mockCollection: vi.fn((_db, name) => ({ path: name })),
  mockQuery: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockServerTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  mockIncrement: vi.fn((v) => ({ _increment: v })),
  mockArrayUnion: vi.fn((v) => ({ _arrayUnion: v })),
  mockDeleteField: vi.fn(() => ({ _deleteField: true })),
  mockOnSnapshot: vi.fn(),
  mockCreateNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/firebase/config', () => ({ db: mocks.db }));

vi.mock('firebase/firestore', () => ({
  collection: mocks.mockCollection,
  addDoc: mocks.mockAddDoc,
  query: mocks.mockQuery,
  where: mocks.mockWhere,
  orderBy: mocks.mockOrderBy,
  getDocs: mocks.mockGetDocs,
  getDoc: mocks.mockGetDoc,
  updateDoc: mocks.mockUpdateDoc,
  setDoc: mocks.mockSetDoc,
  doc: mocks.mockDoc,
  serverTimestamp: mocks.mockServerTimestamp,
  increment: mocks.mockIncrement,
  arrayUnion: mocks.mockArrayUnion,
  deleteField: mocks.mockDeleteField,
  onSnapshot: mocks.mockOnSnapshot,
}));

vi.mock('@/services/notificationService', () => ({
  createNotification: mocks.mockCreateNotification,
  broadcastAnnouncement: vi.fn(),
  subscribeToNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

// ── Imports ────────────────────────────────────────────────────────
import {
  createJob,
  getClientJobs,
  getOpenJobs,
  submitQuote,
  acceptQuote,
  startJob,
  completeJob,
  estimatePrice,
  getJob,
} from '@/services/jobService';
import { haversineKm, formatDistance } from '@/utils/distance';
import { rankJobsForHandyman, tradeMatches, scoreJob } from '@/utils/jobRanking';
import { deriveJobStatus } from '@/features/handyman/constants/jobStatus';

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════
// 1. DISTANCE ESTIMATION
// ═══════════════════════════════════════════════════════════════════
describe('Distance Estimation (haversine)', () => {
  it('returns null for missing coordinates', () => {
    expect(haversineKm(null, { lat: -17.8, lng: 31.0 })).toBeNull();
    expect(haversineKm({ lat: -17.8, lng: 31.0 }, null)).toBeNull();
    expect(haversineKm({ lat: null, lng: 31.0 }, { lat: -17.8, lng: 31.0 })).toBeNull();
  });

  it('calculates distance between Harare and Bulawayo (~360 km)', () => {
    const harare = { lat: -17.8252, lng: 31.0335 };
    const bulawayo = { lat: -20.1325, lng: 28.5803 };
    const km = haversineKm(harare, bulawayo);
    expect(km).toBeGreaterThan(340);
    expect(km).toBeLessThan(380);
  });

  it('returns ~0 for same location', () => {
    const loc = { lat: -17.8252, lng: 31.0335 };
    expect(haversineKm(loc, loc)).toBeCloseTo(0, 1);
  });

  it('formats distances under 1 km as meters', () => {
    expect(formatDistance(0.3)).toBe('300 m');
    expect(formatDistance(0.05)).toBe('50 m');
  });

  it('formats distances >= 1 km with one decimal', () => {
    expect(formatDistance(5.4)).toBe('5.4 km');
    expect(formatDistance(123.7)).toBe('123.7 km');
  });

  it('returns null for null distance', () => {
    expect(formatDistance(null)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. JOB RANKING WITH DISTANCE
// ═══════════════════════════════════════════════════════════════════
describe('Job Ranking with Distance', () => {
  const plumberProfile = {
    trade: 'plumber',
    skills: 'plumbing, pipe fitting',
    location: { lat: -17.8252, lng: 31.0335 }, // Harare CBD
  };

  it('ranks nearby jobs higher (within 5 km gets +40)', () => {
    const nearbyJob = {
      id: 'j1', title: 'Fix leaky tap', category: 'plumbing',
      lat: -17.8300, lng: 31.0400, // ~0.8 km away
    };
    const farJob = {
      id: 'j2', title: 'Fix leaky tap', category: 'plumbing',
      lat: -20.1325, lng: 28.5803, // Bulawayo ~360 km
    };

    const nearbyScore = scoreJob(nearbyJob, plumberProfile);
    const farScore = scoreJob(farJob, plumberProfile);

    expect(nearbyScore.score).toBeGreaterThan(farScore.score);
    expect(nearbyScore.km).toBeLessThan(5);
    expect(farScore.km).toBeGreaterThan(300);
  });

  it('returns estimated km for display to client', () => {
    const job = {
      id: 'j1', title: 'Fix tap', category: 'plumbing',
      lat: -17.8300, lng: 31.0400,
    };
    const { km } = scoreJob(job, plumberProfile);
    expect(km).not.toBeNull();
    expect(typeof km).toBe('number');
    expect(km).toBeGreaterThan(0);
  });

  it('adds distance score: 0-5km = 40, 5-15km = 25, 15-30km = 10, 30+ = 2', () => {
    const makeJob = (lat, lng) => ({
      id: 'j', title: 'Fix tap', category: 'plumbing', lat, lng,
    });

    const close = scoreJob(makeJob(-17.830, 31.040), plumberProfile); // ~0.8 km
    const mid = scoreJob(makeJob(-17.750, 31.100), plumberProfile);    // ~10 km
    const far = scoreJob(makeJob(-17.600, 31.200), plumberProfile);    // ~25 km
    const veryFar = scoreJob(makeJob(-20.13, 28.58), plumberProfile);  // ~360 km

    // Close jobs should score significantly higher than very far
    expect(close.score).toBeGreaterThan(far.score);
    expect(mid.score).toBeGreaterThan(veryFar.score);
  });

  it('trades match boosts score by +50', () => {
    const plumbingJob = { id: 'j', title: 'Burst pipe', category: 'plumbing', lat: -17.83, lng: 31.04 };
    const electricalJob = { id: 'j', title: 'Wiring fault', category: 'electrical', lat: -17.83, lng: 31.04 };

    const plumbingMatch = tradeMatches(plumbingJob, plumberProfile);
    const electricalMatch = tradeMatches(electricalJob, plumberProfile);

    expect(plumbingMatch).toBe(true);
    expect(electricalMatch).toBe(false);

    const pScore = scoreJob(plumbingJob, plumberProfile);
    const eScore = scoreJob(electricalJob, plumberProfile);
    expect(pScore.score - eScore.score).toBeGreaterThanOrEqual(50);
  });

  it('direct requests get +100 bonus', () => {
    const directJob = {
      id: 'j', title: 'Fix tap', handymanId: 'handyman1',
      lat: -17.83, lng: 31.04,
    };
    const openJob = {
      id: 'j2', title: 'Fix tap',
      lat: -17.83, lng: 31.04,
    };

    expect(scoreJob(directJob, plumberProfile).score).toBeGreaterThan(
      scoreJob(openJob, plumberProfile).score
    );
  });

  it('rankJobsForHandyman sorts by score desc, then distance asc', () => {
    const jobs = [
      { id: 'far', title: 'Fix tap', category: 'plumbing', lat: -20.13, lng: 28.58 },
      { id: 'near', title: 'Fix tap', category: 'plumbing', lat: -17.83, lng: 31.04 },
    ];

    const ranked = rankJobsForHandyman(jobs, plumberProfile);
    expect(ranked[0].job.id).toBe('near');
    expect(ranked[1].job.id).toBe('far');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. CATEGORY MATCHING (Explore page fuzzy search)
// ═══════════════════════════════════════════════════════════════════
describe('Category Matching', () => {
  it('tradeMatches detects plumbing from trade + skills', () => {
    const job = { category: 'plumbing', title: 'Leaking tap', description: 'Water leaking from kitchen sink' };
    const plumber = { trade: 'plumber', skills: 'pipe fitting, drainage' };
    const electrician = { trade: 'electrician', skills: 'wiring, sockets' };

    expect(tradeMatches(job, plumber)).toBe(true);
    expect(tradeMatches(job, electrician)).toBe(false);
  });

  it('tradeMatches detects from job description keywords', () => {
    const job = { title: 'Need someone to fix a burst pipe', description: '' };
    const plumber = { trade: 'plumber', skills: '' };
    expect(tradeMatches(job, plumber)).toBe(true);
  });

  it('tradeMatches returns false when no skills match', () => {
    const job = { category: 'painting', title: 'Paint bedroom', description: '' };
    const plumber = { trade: 'plumber', skills: 'plumbing, tap repair' };
    expect(tradeMatches(job, plumber)).toBe(false);
  });

  it('tradeMatches handles empty/missing data gracefully', () => {
    expect(tradeMatches(null, null)).toBe(false);
    expect(tradeMatches({}, {})).toBe(false);
    expect(tradeMatches(null, { trade: 'plumber' })).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. PRICE ESTIMATION PER CATEGORY
// ═══════════════════════════════════════════════════════════════════
describe('Price Estimation', () => {
  it('returns correct ranges for all 10 categories', () => {
    const categories = [
      { name: 'plumbing', low: 45 },
      { name: 'electrical', low: 55 },
      { name: 'cleaning', low: 25 },
      { name: 'carpentry', low: 40 },
      { name: 'painting', low: 35 },
      { name: 'roofing', low: 60 },
      { name: 'mechanic', low: 50 },
      { name: 'gardening', low: 30 },
      { name: 'moving', low: 45 },
      { name: 'construction', low: 70 },
    ];

    categories.forEach(({ name, low }) => {
      const r = estimatePrice({ category: name });
      expect(r.low).toBe(low);
      expect(r.high).toBe(Math.round(low * 2.2));
      expect(r.currency).toBe('USD');
    });
  });

  it('applies urgent multiplier across categories', () => {
    ['plumbing', 'electrical', 'cleaning', 'roofing'].forEach((cat) => {
      const s = estimatePrice({ category: cat, urgency: 'standard' });
      const u = estimatePrice({ category: cat, urgency: 'urgent' });
      expect(u.low).toBe(Math.round(s.low * 1.4));
      expect(u.high).toBe(Math.round(s.high * 1.4));
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. JOB STATUS LIFECYCLE
// ═══════════════════════════════════════════════════════════════════
describe('Job Status Lifecycle', () => {
  it('deriveJobStatus: open → accepted → in_progress → awaiting_payment → paid', () => {
    expect(deriveJobStatus(null)).toBe('open');
    expect(deriveJobStatus({ status: 'open' })).toBe('open');
    expect(deriveJobStatus({ status: 'assigned', progress: 0 })).toBe('accepted');
    expect(deriveJobStatus({ status: 'assigned', progress: 50 })).toBe('in_progress');
    expect(deriveJobStatus({ status: 'completed', paid: false })).toBe('awaiting_payment');
    expect(deriveJobStatus({ status: 'completed', paid: true })).toBe('paid');
    expect(deriveJobStatus({ status: 'disputed' })).toBe('disputed');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. FULL QUOTE FLOW — Bidirectional Communication
// ═══════════════════════════════════════════════════════════════════
describe('Full Quote Flow (Client ↔ Handyman)', () => {
  const CLIENT = { uid: 'client_abc', displayName: 'Alice' };
  const HANDYMAN = { uid: 'pro_xyz', displayName: 'Bob the Plumber' };

  it('STEP 1: Client posts a job → visible to handymen', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'job_001' });

    const jobId = await createJob(
      { title: 'Plumbing: Leaking kitchen tap...', category: 'plumbing', budget: 50, description: 'My kitchen tap is leaking' },
      CLIENT.uid
    );

    expect(jobId).toBe('job_001');

    const written = mocks.mockAddDoc.mock.calls[0][1];
    expect(written.clientId).toBe(CLIENT.uid);
    expect(written.status).toBe('open');
    expect(written.quotes).toEqual([]);
    expect(written.category).toBe('plumbing');
    expect(written.budget).toBe(50);
  });

  it('STEP 2: Client posts targeted job → handyman gets notification', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'job_002' });

    await createJob(
      { title: 'Plumbing: Burst pipe...', category: 'plumbing', budget: 80 },
      CLIENT.uid,
      HANDYMAN.uid
    );

    expect(mocks.mockCreateNotification).toHaveBeenCalledWith(
      HANDYMAN.uid,
      CLIENT.uid,
      'job',
      expect.objectContaining({ text: expect.stringContaining('Plumbing') })
    );
  });

  it('STEP 3: Handyman sends quote → client gets notification', async () => {
    mocks.mockUpdateDoc.mockResolvedValue(undefined);

    await submitQuote('job_001', {
      handymanId: HANDYMAN.uid,
      handymanName: HANDYMAN.displayName,
      price: 45,
      message: 'I can fix this today',
      jobTitle: 'Leaking kitchen tap',
    }, CLIENT.uid);

    // Quote stored with pending status
    const arrayUnionArg = mocks.mockArrayUnion.mock.calls[0][0];
    expect(arrayUnionArg.handymanId).toBe(HANDYMAN.uid);
    expect(arrayUnionArg.price).toBe(45);
    expect(arrayUnionArg.status).toBe('pending');

    // Client notified
    expect(mocks.mockCreateNotification).toHaveBeenCalledWith(
      CLIENT.uid,
      HANDYMAN.uid,
      'quote',
      expect.objectContaining({ text: expect.stringContaining('45') })
    );
  });

  it('STEP 4: Handyman sends multiple quotes from different pros → all stored', async () => {
    mocks.mockUpdateDoc.mockResolvedValue(undefined);

    await submitQuote('job_001', {
      handymanId: 'pro_1', handymanName: 'Bob', price: 45, message: 'Fix today',
    }, CLIENT.uid);

    await submitQuote('job_001', {
      handymanId: 'pro_2', handymanName: 'Charlie', price: 55, message: 'Fix tomorrow',
    }, CLIENT.uid);

    // Both quotes should have been submitted (arrayUnion called twice)
    expect(mocks.mockUpdateDoc).toHaveBeenCalledTimes(2);
    expect(mocks.mockCreateNotification).toHaveBeenCalledTimes(2);
  });

  it('STEP 5: Client accepts a quote → job assigned, other quotes rejected', async () => {
    const existingQuotes = [
      { handymanId: 'pro_1', handymanName: 'Bob', price: 45, status: 'pending', createdAt: { seconds: 100 } },
      { handymanId: 'pro_2', handymanName: 'Charlie', price: 55, status: 'pending', createdAt: { seconds: 200 } },
    ];

    mocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ quotes: existingQuotes, clientId: CLIENT.uid, title: 'Fix tap' }),
    });
    mocks.mockUpdateDoc.mockResolvedValue(undefined);

    await acceptQuote('job_001', { handymanId: 'pro_1', price: 45, createdAt: { seconds: 100 } });

    const [, data] = mocks.mockUpdateDoc.mock.calls[0];
    expect(data.status).toBe('assigned');
    expect(data.handymanId).toBe('pro_1');

    // Pro_1 accepted, Pro_2 rejected
    expect(data.quotes[0].status).toBe('accepted');
    expect(data.quotes[1].status).toBe('rejected');

    // Winning handyman notified
    expect(mocks.mockCreateNotification).toHaveBeenCalledWith(
      'pro_1',
      CLIENT.uid,
      'job',
      expect.objectContaining({ text: expect.stringContaining('accepted') })
    );
  });

  it('STEP 6: Handyman starts work → progress updates', async () => {
    mocks.mockUpdateDoc.mockResolvedValue(undefined);

    await startJob('job_001');

    const [, data] = mocks.mockUpdateDoc.mock.calls[0];
    expect(data.progress).toBe(10);
    expect(data.timeline._arrayUnion.label).toBe('Work started');
  });

  it('STEP 7: Client completes job → handyman gets paid', async () => {
    mocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ balance: 100 }),
    });
    mocks.mockUpdateDoc.mockResolvedValue(undefined);
    mocks.mockSetDoc.mockResolvedValue(undefined);

    await completeJob('job_001', HANDYMAN.uid, 50);

    // Job marked completed
    expect(mocks.mockUpdateDoc).toHaveBeenCalled();
    const [ref] = mocks.mockUpdateDoc.mock.calls[0];
    expect(ref.path).toContain('job_001');

    // Wallet credited
    const walletCalls = mocks.mockUpdateDoc.mock.calls.find(
      (c) => c[0].path?.includes('wallets')
    );
    expect(walletCalls).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. BIDIRECTIONAL VISIBILITY
// ═══════════════════════════════════════════════════════════════════
describe('Bidirectional Visibility', () => {
  it('client sees their own jobs via getClientJobs', async () => {
    mocks.mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'j1', data: () => ({ title: 'Fix tap', status: 'open', clientId: 'client1' }) },
        { id: 'j2', data: () => ({ title: 'Paint house', status: 'assigned', clientId: 'client1' }) },
      ],
    });

    const jobs = await getClientJobs('client1');
    expect(jobs).toHaveLength(2);
    expect(jobs[0].title).toBe('Fix tap');
    expect(jobs[1].status).toBe('assigned');
  });

  it('handyman sees open jobs via getOpenJobs', async () => {
    mocks.mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'j1', data: () => ({ title: 'Fix tap', status: 'open' }) },
        { id: 'j2', data: () => ({ title: 'Wiring', status: 'open' }) },
      ],
    });

    const jobs = await getOpenJobs();
    expect(jobs).toHaveLength(2);
    expect(jobs.every((j) => j.status === 'open')).toBe(true);
  });

  it('job stores both clientId and handymanId for bidirectional linking', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'job_003' });

    await createJob({ title: 'Fix tap' }, 'client_abc', 'handyman_xyz');

    const written = mocks.mockAddDoc.mock.calls[0][1];
    expect(written.clientId).toBe('client_abc');
    expect(written.handymanId).toBe('handyman_xyz');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. DISTANCE IN EXPLORE (cardFromUser pattern)
// ═══════════════════════════════════════════════════════════════════
describe('Distance Display for Clients', () => {
  it('calculates km from client to handyman for display', () => {
    const clientLoc = { lat: -17.8252, lng: 31.0335 }; // Harare CBD
    const handymanLoc = { lat: -17.8500, lng: 31.0500 }; // ~3 km away

    const km = haversineKm(clientLoc, handymanLoc);
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(10);
    expect(formatDistance(km)).toMatch(/km/);
  });

  it('shows meters for very close handyman (< 1 km)', () => {
    const clientLoc = { lat: -17.8252, lng: 31.0335 };
    const handymanLoc = { lat: -17.8260, lng: 31.0340 }; // ~100m away

    const km = haversineKm(clientLoc, handymanLoc);
    expect(formatDistance(km)).toMatch(/m/);
  });

  it('handles missing location gracefully', () => {
    expect(haversineKm(null, { lat: -17.8, lng: 31.0 })).toBeNull();
    expect(haversineKm({ lat: -17.8, lng: 31.0 }, null)).toBeNull();
    expect(formatDistance(null)).toBeNull();
  });
});
