import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const getWallet = async (uid) => {
  const snap = await getDoc(doc(db, 'wallets', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : { balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 };
};

export const subscribeToWallet = (uid, callback) => {
  return onSnapshot(doc(db, 'wallets', uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : { balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 });
  }, () => callback({ balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 }));
};

export const getTransactions = async (uid) => {
  const q = query(collection(db, 'transactions'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToTransactions = (uid, callback) => {
  const q = query(collection(db, 'transactions'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    () => callback([])
  );
};

// Rebuild the transaction history from actual payments and payouts that exist in the
// database, so the wallet always reflects real money moved even if older records were
// never written. Idempotent — existing transactions are never duplicated.
export const backfillTransactionHistory = async (uid) => {
  if (!uid) return 0;

  const [existingSnap, payerSnap, recipientSnap, payoutSnap] = await Promise.all([
    getDocs(query(collection(db, 'transactions'), where('uid', '==', uid))),
    getDocs(query(collection(db, 'payments'), where('payerId', '==', uid))),
    getDocs(query(collection(db, 'payments'), where('recipientId', '==', uid))),
    getDocs(query(collection(db, 'payouts'), where('handymanId', '==', uid))),
  ]);

  const keyOf = (t) => `${t.type}|${t.kind}|${Number(t.amount || 0)}|${t.jobId || ''}|${t.method || ''}`;
  const seen = new Set(existingSnap.docs.map((d) => keyOf(d.data())));

  const completedPayments = [...payerSnap.docs, ...recipientSnap.docs]
    .filter((d) => d.data().status === 'completed')
    .map((d) => ({ id: d.id, ...d.data() }));

  const jobIds = [...new Set(completedPayments.map((p) => p.jobId).filter(Boolean))];
  const categoryByJob = {};
  await Promise.all(
    jobIds.map(async (jobId) => {
      const snap = await getDoc(doc(db, 'jobs', jobId));
      if (snap.exists()) categoryByJob[jobId] = snap.data().category || null;
    })
  );

  const writes = [];
  const enqueue = (id, data) => {
    if (seen.has(keyOf(data))) return;
    seen.add(keyOf(data));
    writes.push({ id, data });
  };

  completedPayments.forEach((p) => {
    const amount = Number(p.amount || 0);
    if (!amount) return;
    const createdAt = p.completedAt || p.createdAt || serverTimestamp();
    const category = p.jobId ? categoryByJob[p.jobId] || null : null;
    if (p.payerId === uid) {
      enqueue(`pp-${p.id}`, {
        uid,
        type: 'payment',
        kind: 'debit',
        amount,
        description: `Paid ${p.recipientName || 'professional'} for "${p.jobTitle || 'job'}"`,
        category,
        jobId: p.jobId || null,
        paymentId: p.id,
        createdAt,
      });
    }
    if (p.recipientId === uid) {
      enqueue(`rp-${p.id}`, {
        uid,
        type: 'payment',
        kind: 'credit',
        amount,
        description: `Payment received for "${p.jobTitle || 'job'}"`,
        category,
        jobId: p.jobId || null,
        paymentId: p.id,
        createdAt,
      });
    }
  });

  payoutSnap.docs.forEach((d) => {
    const data = d.data();
    const amount = Number(data.amount || 0);
    if (!amount) return;
    enqueue(`pw-${d.id}`, {
      uid,
      type: 'withdrawal',
      kind: 'debit',
      amount,
      description: `Withdrawal to ${data.method || 'bank'}`,
      method: data.method || 'bank',
      payoutId: d.id,
      createdAt: data.createdAt || serverTimestamp(),
    });
  });

  await Promise.all(writes.map(({ id, data }) => setDoc(doc(db, 'transactions', id), data, { merge: true })));
  return writes.length;
};
