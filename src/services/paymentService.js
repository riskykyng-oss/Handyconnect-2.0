import { collection, addDoc, query, where, limit, getDocs, getDoc, updateDoc, onSnapshot, serverTimestamp, increment, doc, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { createNotification } from '@/services/notificationService';

export const MIN_WITHDRAWAL = 20;

/* ─── QR TOKENS ─── */

const TOKEN_PREFIX = 'HC-PAY';
const TOKEN_VERSION = 'v1';

export const encodePaymentToken = (paymentId) => `${TOKEN_PREFIX}|${TOKEN_VERSION}|${paymentId}`;

export const decodePaymentToken = (text) => {
  const parts = String(text || '').trim().split('|');
  if (parts.length === 3 && parts[0] === TOKEN_PREFIX && parts[1] === TOKEN_VERSION) {
    return parts[2];
  }
  return null;
};

const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

/* ─── PAYMENTS ─── */

// Receiver (handyman) requests a payment for a job → shows the QR for the payer to scan.
export const createPaymentRequest = async ({ jobId, jobTitle, amount, recipientId, recipientName }) => {
  const code = generateCode();
  const ref = await addDoc(collection(db, 'payments'), {
    type: 'job',
    jobId,
    jobTitle: jobTitle || 'Job payment',
    amount: Number(amount) || 0,
    currency: 'USD',
    recipientId,
    recipientName: recipientName || 'Professional',
    payerId: null,
    payerName: null,
    code,
    status: 'pending',
    createdAt: serverTimestamp(),
    completedAt: null,
  });
  return { id: ref.id, code };
};

export const getPayment = async (paymentId) => {
  if (!paymentId) return null;
  const snap = await getDoc(doc(db, 'payments', paymentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getPaymentByCode = async (code) => {
  const q = query(collection(db, 'payments'), where('code', '==', (code || '').trim().toUpperCase()), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const subscribeToPayment = (paymentId, callback) =>
  onSnapshot(doc(db, 'payments', paymentId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, () => callback(null));

export const cancelPayment = (paymentId) =>
  updateDoc(doc(db, 'payments', paymentId), { status: 'cancelled' });

// Payer confirms after scanning: settles the payment, credits the wallet and records transactions.
export const confirmPayment = async (paymentId, payerId, payerName) => {
  let payment;
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'payments', paymentId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Payment not found');
    payment = snap.data();
    if (payment.status !== 'pending') throw new Error('This payment is no longer pending');
    if (payment.payerId && payment.payerId !== payerId) throw new Error('Payment already confirmed by someone else');

    let category = null;
    if (payment.jobId) {
      const jobSnap = await tx.get(doc(db, 'jobs', payment.jobId));
      if (jobSnap.exists()) category = jobSnap.data().category || null;
    }

    tx.update(ref, {
      status: 'completed',
      payerId,
      payerName: payerName || 'Client',
      completedAt: serverTimestamp(),
    });

    const walletRef = doc(db, 'wallets', payment.recipientId);
    tx.set(walletRef, { balance: increment(payment.amount), currency: 'USD' }, { merge: true });

    tx.set(doc(collection(db, 'transactions')), {
      uid: payment.recipientId,
      type: 'payment',
      kind: 'credit',
      amount: payment.amount,
      description: `Payment received for "${payment.jobTitle}"`,
      category,
      jobId: payment.jobId || null,
      createdAt: serverTimestamp(),
    });
    tx.set(doc(collection(db, 'transactions')), {
      uid: payerId,
      type: 'payment',
      kind: 'debit',
      amount: payment.amount,
      description: `Paid ${payment.recipientName} for "${payment.jobTitle}"`,
      category,
      jobId: payment.jobId || null,
      createdAt: serverTimestamp(),
    });

    if (payment.jobId) tx.update(doc(db, 'jobs', payment.jobId), { paid: true });
  });

  try {
    await createNotification(payment.recipientId, payerId, 'payment', { text: `You received $${payment.amount} for "${payment.jobTitle}"` });
    await createNotification(payerId, payment.recipientId, 'payment', { text: `You paid $${payment.amount} to ${payment.recipientName} for "${payment.jobTitle}"` });
  } catch { /* notifications are best-effort */ }

  return payment;
};

/* ─── WALLET OPERATIONS ─── */

// Client tops up their wallet from a stored payment method.
export const addFunds = async (uid, amount, method = 'Visa') => {
  const value = Number(amount);
  if (!value || value <= 0) throw new Error('Enter a valid amount');
  const walletRef = doc(db, 'wallets', uid);
  return runTransaction(db, async (tx) => {
    tx.set(walletRef, { balance: increment(value), currency: 'USD' }, { merge: true });
    tx.set(doc(collection(db, 'transactions')), {
      uid,
      type: 'topup',
      kind: 'credit',
      amount: value,
      description: `Added funds via ${method}`,
      method,
      createdAt: serverTimestamp(),
    });
  });
};

// Handyman withdraws earnings instantly to a money method (demo processing).
export const requestWithdrawal = async (uid, amount, method = 'EcoCash') => {
  const value = Number(amount);
  if (!value || value <= 0) throw new Error('Enter a valid amount');
  if (value < MIN_WITHDRAWAL) throw new Error(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
  const walletRef = doc(db, 'wallets', uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(walletRef);
    const balance = snap.exists() ? Number(snap.data().balance) || 0 : 0;
    if (balance < value) throw new Error('Insufficient balance');
    tx.set(doc(collection(db, 'payouts')), {
      handymanId: uid,
      amount: value,
      method,
      status: 'paid',
      createdAt: serverTimestamp(),
    });
    tx.update(walletRef, { balance: balance - value });
    tx.set(doc(collection(db, 'transactions')), {
      uid,
      type: 'withdrawal',
      kind: 'debit',
      amount: value,
      description: `Withdrawal to ${method}`,
      method,
      createdAt: serverTimestamp(),
    });
  });
};

/* ─── SUBSCRIPTIONS ─── */

// Payments where the current user is the payer or the recipient (client vs handyman).
export const subscribeToUserPayments = (uid, field, onUpdate) => {
  const q = query(collection(db, 'payments'), where(field, '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date() };
      });
      list.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      onUpdate(list);
    },
    () => onUpdate([])
  );
};

export const subscribeToMyPayouts = (uid, onUpdate) => {
  const q = query(collection(db, 'payouts'), where('handymanId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date() };
      });
      list.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      onUpdate(list);
    },
    () => onUpdate([])
  );
};
