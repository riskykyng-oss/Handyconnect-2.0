import { describe, it, expect, vi, beforeEach } from 'vitest';

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
}));

vi.mock('@/services/notificationService', () => ({
  createNotification: mocks.mockCreateNotification,
}));

import {
  createJob,
  getJob,
  getClientJobs,
  getOpenJobs,
  getAssignedJobs,
  getHandymanJobs,
  estimatePrice,
} from '@/services/jobService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createJob', () => {
  it('creates a job with correct default fields', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'job_001' });

    const id = await createJob({ title: 'Fix tap', category: 'plumbing', budget: 45 }, 'client1');
    expect(id).toBe('job_001');

    const written = mocks.mockAddDoc.mock.calls[0][1];
    expect(written.clientId).toBe('client1');
    expect(written.handymanId).toBeNull();
    expect(written.status).toBe('open');
    expect(written.timeline).toHaveLength(1);
    expect(written.timeline[0].type).toBe('posted');
    expect(written.milestones).toEqual([]);
    expect(written.quotes).toEqual([]);
  });

  it('sets handymanId when provided', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'job_002' });
    await createJob({ title: 'Wiring' }, 'client1', 'handyman1');
    expect(mocks.mockAddDoc.mock.calls[0][1].handymanId).toBe('handyman1');
  });
});

describe('getJob', () => {
  it('returns null for nonexistent job', async () => {
    mocks.mockGetDoc.mockResolvedValue({ exists: () => false });
    expect(await getJob('nonexistent')).toBeNull();
  });

  it('returns job data when it exists', async () => {
    mocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'job_001',
      data: () => ({ title: 'Fix tap', status: 'open' }),
    });
    const job = await getJob('job_001');
    expect(job.id).toBe('job_001');
    expect(job.title).toBe('Fix tap');
  });
});

describe('getter functions', () => {
  const mockDocs = (docs) => {
    mocks.mockGetDocs.mockResolvedValue({
      docs: docs.map((d) => ({ id: d.id, data: () => d })),
    });
  };

  it('getClientJobs returns mapped docs', async () => {
    mockDocs([{ id: 'j1', title: 'Job 1' }, { id: 'j2', title: 'Job 2' }]);
    const jobs = await getClientJobs('client1');
    expect(jobs).toHaveLength(2);
    expect(jobs[0].id).toBe('j1');
  });

  it('getOpenJobs returns mapped docs', async () => {
    mockDocs([{ id: 'j1', status: 'open' }]);
    expect((await getOpenJobs())).toHaveLength(1);
  });

  it('getAssignedJobs returns mapped docs', async () => {
    mockDocs([{ id: 'j1', status: 'assigned' }]);
    expect((await getAssignedJobs('h1'))).toHaveLength(1);
  });

  it('getHandymanJobs returns mapped docs', async () => {
    mockDocs([{ id: 'j1' }, { id: 'j2' }]);
    expect((await getHandymanJobs('h1'))).toHaveLength(2);
  });
});

describe('estimatePrice', () => {
  it('returns base price for plumbing', () => {
    const r = estimatePrice({ category: 'plumbing' });
    expect(r.low).toBe(45);
    expect(r.high).toBe(Math.round(45 * 2.2));
    expect(r.currency).toBe('USD');
  });

  it('returns base price for cleaning', () => {
    expect(estimatePrice({ category: 'cleaning' }).low).toBe(25);
  });

  it('applies 1.4x multiplier for urgent', () => {
    const s = estimatePrice({ category: 'electrical', urgency: 'standard' });
    const u = estimatePrice({ category: 'electrical', urgency: 'urgent' });
    expect(u.low).toBe(Math.round(s.low * 1.4));
  });

  it('returns default base for unknown category', () => {
    expect(estimatePrice({ category: 'unknown' }).low).toBe(35);
  });

  it('handles missing category', () => {
    expect(estimatePrice({}).low).toBe(35);
  });
});
