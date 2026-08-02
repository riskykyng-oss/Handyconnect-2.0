import { collection, query, orderBy, onSnapshot, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase/config';

/* ─── REAL-TIME SUBSCRIPTIONS ─── */

// Subscribe to all users (admin-only read). Docs are sorted client-side since some
// legacy docs may lack createdAt and would be silently dropped by orderBy.
export const subscribeToUsers = (callback) => {
  const unsub = onSnapshot(
    collection(db, 'users'),
    (snap) => {
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      users.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      callback(users);
    },
    (err) => {
      console.error('Admin users subscription error:', err);
      callback([]);
    }
  );
  return unsub;
};

export const subscribeToJobs = (callback) => {
  const unsub = onSnapshot(
    query(collection(db, 'jobs'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error('Admin jobs subscription error:', err);
      callback([]);
    }
  );
  return unsub;
};

/* ─── ONE-SHOT FETCHES ─── */

export const listAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const listAllJobs = async () => {
  const snap = await getDocs(query(collection(db, 'jobs'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ─── USER MANAGEMENT ─── */

export const adminUpdateUserRole = (uid, role) =>
  updateDoc(doc(db, 'users', uid), { role, roleUpdatedAt: serverTimestamp() });

export const adminSetUserSuspended = (uid, suspended) =>
  updateDoc(doc(db, 'users', uid), {
    suspended,
    suspendedAt: suspended ? serverTimestamp() : null,
  });

/* ─── JOB MANAGEMENT ─── */

export const adminCancelJob = (jobId) =>
  updateDoc(doc(db, 'jobs', jobId), {
    status: 'cancelled',
    timeline: arrayUnion({ type: 'admin', label: 'Job cancelled by admin', createdAt: new Date() }),
  });

export const adminResolveDispute = (jobId, resolution = 'Reviewed and resolved by admin') =>
  updateDoc(doc(db, 'jobs', jobId), {
    status: 'open',
    'dispute.status': 'resolved',
    'dispute.resolution': resolution,
    'dispute.resolvedAt': serverTimestamp(),
    timeline: arrayUnion({ type: 'dispute', label: 'Dispute resolved by admin', createdAt: new Date() }),
  });

/* ─── COMMUNITY MODERATION ─── */

export const adminDeletePost = (postId) => deleteDoc(doc(db, 'posts', postId));

/* ─── VERIFICATION ─── */

export const adminSetVerified = (uid, verified, note = '') =>
  updateDoc(doc(db, 'users', uid), {
    verified,
    verifiedAt: verified ? serverTimestamp() : null,
    verifiedRequest: verified ? 'approved' : note || 'rejected',
  });

/* ─── WALLETS & PAYOUTS ─── */

export const listAllWallets = async () => {
  const snap = await getDocs(collection(db, 'wallets'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const listAllPayouts = async () => {
  const snap = await getDocs(query(collection(db, 'payouts'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Atomically record a payout and debit the handyman's wallet balance.
export const adminProcessPayout = async (handymanId, amount, method = 'Mobile Money') => {
  if (!amount || amount <= 0) throw new Error('Invalid payout amount');
  const walletRef = doc(db, 'wallets', handymanId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(walletRef);
    const balance = snap.exists() ? Number(snap.data().balance) || 0 : 0;
    if (balance < amount) throw new Error('Insufficient wallet balance');
    const payoutRef = doc(collection(db, 'payouts'));
    tx.set(payoutRef, {
      handymanId,
      amount,
      method,
      status: 'paid',
      createdAt: serverTimestamp(),
    });
    tx.update(walletRef, { balance: balance - amount });
    tx.set(doc(collection(db, 'transactions')), {
      uid: handymanId,
      type: 'withdrawal',
      kind: 'debit',
      amount,
      description: `Withdrawal to ${method}`,
      method,
      createdAt: serverTimestamp(),
    });
  });
};
