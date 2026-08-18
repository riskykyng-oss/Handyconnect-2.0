import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  db: {},
  mockGetDoc: vi.fn(),
  mockGetDocs: vi.fn(),
  mockSetDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockDoc: vi.fn((_db, path, ...segs) => ({ path: [path, ...segs].join('/') })),
  mockCollection: vi.fn((_db, name) => ({ path: name })),
  mockQuery: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockServerTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
}));

vi.mock('@/firebase/config', () => ({ db: mocks.db }));

vi.mock('firebase/firestore', () => ({
  collection: mocks.mockCollection,
  doc: mocks.mockDoc,
  getDoc: mocks.mockGetDoc,
  getDocs: mocks.mockGetDocs,
  setDoc: mocks.mockSetDoc,
  onSnapshot: mocks.mockOnSnapshot,
  query: mocks.mockQuery,
  where: mocks.mockWhere,
  orderBy: mocks.mockOrderBy,
  serverTimestamp: mocks.mockServerTimestamp,
}));

import { getWallet, subscribeToWallet, getTransactions, subscribeToTransactions } from '@/services/walletService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getWallet', () => {
  it('returns wallet data when document exists', async () => {
    mocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'wallet1',
      data: () => ({ balance: 100, currency: 'USD', pending: 0, coupons: 0, credits: 0 }),
    });

    const wallet = await getWallet('user1');
    expect(wallet.id).toBe('wallet1');
    expect(wallet.balance).toBe(100);
  });

  it('returns default wallet when document does not exist', async () => {
    mocks.mockGetDoc.mockResolvedValue({ exists: () => false });

    const wallet = await getWallet('user1');
    expect(wallet.balance).toBe(0);
    expect(wallet.currency).toBe('USD');
    expect(wallet.pending).toBe(0);
    expect(wallet.coupons).toBe(0);
    expect(wallet.credits).toBe(0);
  });
});

describe('subscribeToWallet', () => {
  it('calls callback with wallet data on snapshot', () => {
    const callback = vi.fn();
    mocks.mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => true, id: 'w1', data: () => ({ balance: 50, currency: 'USD' }) });
      return vi.fn();
    });

    subscribeToWallet('user1', callback);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ balance: 50 }));
  });

  it('calls callback with defaults when doc does not exist', () => {
    const callback = vi.fn();
    mocks.mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: () => false });
      return vi.fn();
    });

    subscribeToWallet('user1', callback);
    expect(callback).toHaveBeenCalledWith({ balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 });
  });

  it('fires defaults on error when no prior data', () => {
    const callback = vi.fn();
    mocks.mockOnSnapshot.mockImplementation((_ref, _onNext, onError) => {
      onError(new Error('fail'));
      return vi.fn();
    });

    subscribeToWallet('user1', callback);
    expect(callback).toHaveBeenCalledWith({ balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 });
  });

  it('does NOT reset to zero on error when lastKnown exists', () => {
    const callback = vi.fn();
    let capturedOnNext;
    mocks.mockOnSnapshot.mockImplementation((_ref, onNext) => {
      capturedOnNext = onNext;
      return vi.fn();
    });

    subscribeToWallet('user1', callback);

    capturedOnNext({ exists: () => true, id: 'w1', data: () => ({ balance: 111, currency: 'USD' }) });
    expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ balance: 111 }));

    // Simulate transient error
    mocks.mockOnSnapshot.mock.calls[0][2](new Error('transient'));

    const zeroCalls = callback.mock.calls.filter(
      ([arg]) => arg && typeof arg === 'object' && arg.balance === 0 && arg.currency === 'USD'
    );
    // Should NOT have been called with balance: 0 after error — bug was $111 flashing to $0
    expect(zeroCalls).toHaveLength(0);
  });
});

describe('getTransactions', () => {
  it('returns mapped transaction docs', async () => {
    mocks.mockGetDocs.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ amount: 50, type: 'payment' }) },
        { id: 't2', data: () => ({ amount: 20, type: 'topup' }) },
      ],
    });

    const txns = await getTransactions('user1');
    expect(txns).toHaveLength(2);
    expect(txns[0].id).toBe('t1');
    expect(txns[1].amount).toBe(20);
  });

  it('returns empty array when no transactions', async () => {
    mocks.mockGetDocs.mockResolvedValue({ docs: [] });
    expect(await getTransactions('user1')).toEqual([]);
  });
});

describe('subscribeToTransactions', () => {
  it('calls callback with transaction list', () => {
    const callback = vi.fn();
    mocks.mockOnSnapshot.mockImplementation((_q, onNext) => {
      onNext({ docs: [{ id: 't1', data: () => ({ amount: 50 }) }] });
      return vi.fn();
    });

    subscribeToTransactions('user1', callback);
    expect(callback).toHaveBeenCalledWith([expect.objectContaining({ id: 't1', amount: 50 })]);
  });

  it('does NOT reset to empty on error when data exists', () => {
    const callback = vi.fn();
    let capturedOnNext;
    mocks.mockOnSnapshot.mockImplementation((_q, onNext) => {
      capturedOnNext = onNext;
      return vi.fn();
    });

    subscribeToTransactions('user1', callback);
    capturedOnNext({ docs: [{ id: 't1', data: () => ({ amount: 100 }) }] });
    expect(callback).toHaveBeenLastCalledWith([expect.objectContaining({ amount: 100 })]);

    mocks.mockOnSnapshot.mock.calls[0][2](new Error('fail'));
    const emptyCalls = callback.mock.calls.filter(([arg]) => Array.isArray(arg) && arg.length === 0);
    expect(emptyCalls).toHaveLength(0);
  });

  it('calls with empty array on error when no prior data', () => {
    const callback = vi.fn();
    mocks.mockOnSnapshot.mockImplementation((_q, _onNext, onError) => {
      onError(new Error('fail'));
      return vi.fn();
    });

    subscribeToTransactions('user1', callback);
    expect(callback).toHaveBeenCalledWith([]);
  });
});
