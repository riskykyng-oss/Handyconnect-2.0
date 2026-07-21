import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, updateDoc, setDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Create a new job
export const createJob = async (jobData, clientUid) => {
  const jobsCollectionRef = collection(db, 'jobs');
  const docRef = await addDoc(jobsCollectionRef, {
    ...jobData,
    clientId: clientUid,
    status: 'open',
    createdAt: serverTimestamp()
  });
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

// Handyman accepts a job
export const acceptJob = async (jobId, handymanId, handymanName) => {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    status: 'assigned',
    handymanId: handymanId,
    handymanName: handymanName
  });
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