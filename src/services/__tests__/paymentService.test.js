import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  db: {},
  mockAddDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockGetDocs: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockRunTransaction: vi.fn(),
  mockSetDoc: vi.fn(),
  mockDoc: vi.fn((_db, path, ...segs) => ({ path: [path, ...segs].join('/') })),
  mockCollection: vi.fn((_db, name) => ({ path: name })),
  mockQuery: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockOrderBy: vi.fn(),
  mockServerTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  mockIncrement: vi.fn((v) => ({ _increment: v })),
  mockCreateNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/firebase/config', () => ({ db: mocks.db }));

vi.mock('firebase/firestore', () => ({
  collection: mocks.mockCollection,
  addDoc: mocks.mockAddDoc,
  query: mocks.mockQuery,
  where: mocks.mockWhere,
  limit: mocks.mockLimit,
  orderBy: mocks.mockOrderBy,
  getDocs: mocks.mockGetDocs,
  getDoc: mocks.mockGetDoc,
  updateDoc: mocks.mockUpdateDoc,
  onSnapshot: mocks.mockOnSnapshot,
  serverTimestamp: mocks.mockServerTimestamp,
  increment: mocks.mockIncrement,
  doc: mocks.mockDoc,
  runTransaction: mocks.mockRunTransaction,
  setDoc: mocks.mockSetDoc,
}));

vi.mock('@/services/notificationService', () => ({
  createNotification: mocks.mockCreateNotification,
}));

import {
  encodePaymentToken,
  decodePaymentToken,
  MIN_WITHDRAWAL,
  createPaymentRequest,
  getPayment,
  getPaymentByCode,
  cancelPayment,
  confirmPayment,
  addFunds,
  requestWithdrawal,
} from '@/services/paymentService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('QR token encoding/decoding', () => {
  it('encodes a payment ID into a valid token', () => {
    expect(encodePaymentToken('abc123')).toBe('HC-PAY|v1|abc123');
  });

  it('decodes a valid token back to the payment ID', () => {
    expect(decodePaymentToken('HC-PAY|v1|abc123')).toBe('abc123');
  });

  it('returns null for an invalid token format', () => {
    expect(decodePaymentToken('invalid-token')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodePaymentToken('')).toBeNull();
  });

  it('returns null for a token with wrong prefix', () => {
    expect(decodePaymentToken('WRONG|v1|abc123')).toBeNull();
  });

  it('returns null for a token with wrong version', () => {
    expect(decodePaymentToken('HC-PAY|v2|abc123')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(decodePaymentToken(null)).toBeNull();
  });

  it('handles whitespace around token', () => {
    expect(decodePaymentToken('  HC-PAY|v1|abc123  ')).toBe('abc123');
  });
});

describe('MIN_WITHDRAWAL', () => {
  it('is set to $20', () => {
    expect(MIN_WITHDRAWAL).toBe(20);
  });
});

describe('createPaymentRequest', () => {
  it('creates a payment with correct fields', async () => {
    mocks.mockAddDoc.mockResolvedValue({ id: 'pay_001' });

    const result = await createPaymentRequest({
      jobId: 'job_1',
      jobTitle: 'Plumbing repair',
      amount: 50,
      recipientId: 'pro_1',
      recipientName: 'John',
    });

    expect(result.id).toBe('pay_001');
    expect(result.code).toMatch(/^[A-Z0-9]{6}$/);

    const written = mocks.mockAddDoc.mock.calls[0][1];
    expect(written.type).toBe('job');
    expect(written.amount).toBe(50);
    expect(written.recipientId).toBe('pro_1');
    expect(written.payerId).toBeNull();
    expect(written.status).toBe('pending');
    expect(written.currency).toBe('USD');
  });
});

describe('getPayment', () => {
  it('returns null for a falsy paymentId', async () => {
    expect(await getPayment(null)).toBeNull();
    expect(await getPayment('')).toBeNull();
  });

  it('returns the payment data when it exists', async () => {
    mocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'pay_001',
      data: () => ({ amount: 50, status: 'pending' }),
    });

    const result = await getPayment('pay_001');
    expect(result.id).toBe('pay_001');
    expect(result.amount).toBe(50);
  });

  it('returns null when document does not exist', async () => {
    mocks.mockGetDoc.mockResolvedValue({ exists: () => false });
    expect(await getPayment('nonexistent')).toBeNull();
  });
});

describe('getPaymentByCode', () => {
  it('returns null when no payment matches', async () => {
    mocks.mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
    expect(await getPaymentByCode('ABC123')).toBeNull();
  });

  it('returns the first matching payment', async () => {
    mocks.mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: 'pay_001', data: () => ({ code: 'ABC123', amount: 30 }) }],
    });

    const result = await getPaymentByCode('abc123');
    expect(result.id).toBe('pay_001');
  });
});

describe('addFunds', () => {
  it('throws for invalid amount', async () => {
    await expect(addFunds('uid1', 0)).rejects.toThrow('Enter a valid amount');
    await expect(addFunds('uid1', -5)).rejects.toThrow('Enter a valid amount');
    await expect(addFunds('uid1', 'abc')).rejects.toThrow('Enter a valid amount');
  });

  it('calls runTransaction for valid amount', async () => {
    mocks.mockRunTransaction.mockImplementation((_db, fn) => fn({ set: vi.fn(), get: vi.fn() }));
    await addFunds('uid1', 100, 'Visa');
    expect(mocks.mockRunTransaction).toHaveBeenCalled();
  });
});

describe('requestWithdrawal', () => {
  it('throws for invalid amount', async () => {
    await expect(requestWithdrawal('uid1', 0)).rejects.toThrow('Enter a valid amount');
    await expect(requestWithdrawal('uid1', -10)).rejects.toThrow('Enter a valid amount');
  });

  it('throws when below minimum withdrawal', async () => {
    await expect(requestWithdrawal('uid1', 10)).rejects.toThrow(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
  });

  it('throws when balance is insufficient', async () => {
    mocks.mockRunTransaction.mockImplementation(async (_db, fn) => {
      const tx = {
        get: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ balance: 15 }) }),
        set: vi.fn(),
        update: vi.fn(),
      };
      return fn(tx);
    });

    await expect(requestWithdrawal('uid1', 20)).rejects.toThrow('Insufficient balance');
  });
});

describe('cancelPayment', () => {
  it('calls updateDoc with status cancelled', async () => {
    mocks.mockUpdateDoc.mockResolvedValue(undefined);
    await cancelPayment('pay_001');
    expect(mocks.mockUpdateDoc).toHaveBeenCalled();
    expect(mocks.mockUpdateDoc.mock.calls[0][1].status).toBe('cancelled');
  });
});

describe('confirmPayment', () => {
  it('throws when payment not found', async () => {
    mocks.mockRunTransaction.mockImplementation(async (_db, fn) => {
      const tx = { get: vi.fn().mockResolvedValue({ exists: () => false }), set: vi.fn(), update: vi.fn() };
      return fn(tx);
    });
    await expect(confirmPayment('pay_001', 'payer1', 'Test')).rejects.toThrow('Payment not found');
  });

  it('throws when payment is not pending', async () => {
    mocks.mockRunTransaction.mockImplementation(async (_db, fn) => {
      const tx = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ status: 'completed', payerId: null, recipientId: 'r1', amount: 50, jobTitle: 'Job' }),
        }),
        set: vi.fn(),
        update: vi.fn(),
      };
      return fn(tx);
    });
    await expect(confirmPayment('pay_001', 'payer1', 'Test')).rejects.toThrow('no longer pending');
  });
});
