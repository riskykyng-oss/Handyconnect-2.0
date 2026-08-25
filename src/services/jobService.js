import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, updateDoc, setDoc, increment, getDoc, arrayUnion, deleteField } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { createNotification } from '@/services/notificationService';

// Create a new job. Pass handymanId to target one professional directly.
export const createJob = async (jobData, clientUid, handymanId = null) => {
  const jobsCollectionRef = collection(db, 'jobs');
  const docRef = await addDoc(jobsCollectionRef, {
    ...jobData,
    clientId: clientUid,
    handymanId: handymanId || null,
    status: 'open',
    timeline: [{ type: 'posted', label: 'Job posted', createdAt: new Date() }],
    milestones: [],
    quotes: [],
    attachments: jobData.attachments || [],
    createdAt: serverTimestamp()
  });
  if (handymanId) {
    createNotification(handymanId, clientUid, 'job', { text: `New job request: ${jobData.title || 'Untitled job'}` }).catch(() => {});
  }
  return docRef.id;
};

// Fetch all jobs posted by a specific client
export const getClientJobs = async (clientUid) => {
  const q = query(
    collection(db, 'jobs'), 
    where('clientId', '==', clientUid),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch all open jobs for handymen to see
export const getOpenJobs = async () => {
  const q = query(
    collection(db, 'jobs'), 
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch jobs assigned to a specific handyman
export const getAssignedJobs = async (handymanId) => {
  const q = query(
    collection(db, 'jobs'), 
    where('handymanId', '==', handymanId),
    where('status', '==', 'assigned')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch every job a handyman has ever worked on (any status)
export const getHandymanJobs = async (handymanId) => {
  const q = query(
    collection(db, 'jobs'),
    where('handymanId', '==', handymanId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Handyman marks an assigned job as started
export const startJob = async (jobId) =>
  updateDoc(doc(db, 'jobs', jobId), {
    progress: 10,
    startedAt: serverTimestamp(),
    timeline: arrayUnion({ type: 'progress', label: 'Work started', createdAt: new Date() }),
  });

// Handyman accepts a job
export const acceptJob = async (jobId, handymanId, handymanName) => {
  const jobRef = doc(db, 'jobs', jobId);
  const jobSnap = await getDoc(jobRef);
  const job = jobSnap.data() || {};
  await updateDoc(jobRef, {
    status: 'assigned',
    handymanId: handymanId,
    handymanName: handymanName
  });
  if (job.clientId) {
    createNotification(job.clientId, handymanId, 'job', { text: `${handymanName} accepted your job "${job.title || 'Job'}"` }).catch(() => {});
  }
};

// Client marks a job as completed, crediting the handyman
export const completeJob = async (jobId, handymanId, budget) => {
  const jobRef = doc(db, 'jobs', jobId);
  const walletRef = doc(db, 'wallets', handymanId);

  // 1. Update job status to 'completed'
  await updateDoc(jobRef, { status: 'completed' });

  // 2. Initialize wallet if it doesn't exist, then add funds
  const walletSnap = await getDoc(walletRef);
  if (!walletSnap.exists()) {
    await setDoc(walletRef, { balance: 0, currency: 'USD' });
  }
  await updateDoc(walletRef, { balance: increment(budget) });
};

export const submitQuote = async (jobId, quote) => updateDoc(doc(db, 'jobs', jobId), { quotes: arrayUnion({ ...quote, createdAt: new Date(), status: 'pending' }), timeline: arrayUnion({ type: 'quote', label: 'New quote received', createdAt: new Date() }) });
export const addMilestone = async (jobId, milestone) => updateDoc(doc(db, 'jobs', jobId), { milestones: arrayUnion({ ...milestone, status: 'pending', createdAt: new Date() }), timeline: arrayUnion({ type: 'milestone', label: milestone.title, createdAt: new Date() }) });
export const updateJobProgress = async (jobId, progress, label = 'Progress updated') => updateDoc(doc(db, 'jobs', jobId), { progress, timeline: arrayUnion({ type: 'progress', label, createdAt: new Date() }) });
export const openDispute = async (jobId, reason, openedBy) => updateDoc(doc(db, 'jobs', jobId), { status: 'disputed', dispute: { reason, openedBy, openedAt: new Date(), status: 'open' }, timeline: arrayUnion({ type: 'dispute', label: 'Dispute opened', createdAt: new Date() }) });
export const getJob = async (jobId) => { const snap = await getDoc(doc(db, 'jobs', jobId)); return snap.exists() ? { id: snap.id, ...snap.data() } : null; };

// Handyman declines a targeted request — job returns to the open pool.
export const declineJob = async (jobId) => updateDoc(doc(db, 'jobs', jobId), { handymanId: deleteField() });
export const estimatePrice = ({ category, urgency = 'standard' }) => { const base = { plumbing: 45, electrical: 55, cleaning: 25, carpentry: 40, painting: 35, roofing: 60, mechanic: 50, gardening: 30, moving: 45, construction: 70 }[category?.toLowerCase()] || 35; const multiplier = urgency === 'urgent' ? 1.4 : 1; return { low: Math.round(base * multiplier), high: Math.round(base * multiplier * 2.2), currency: 'USD' }; };
