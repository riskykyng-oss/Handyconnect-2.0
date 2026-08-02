import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Loader2, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';

// TEMPORARY dev-only page: deletes all demo docs from the Firestore `stories`
// collection (leftovers from the old seedDemoStories). Remove this route after use.
export default function PurgeStoriesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'stories'));
        setStories(snap.docs.map((d) => ({ id: d.id, name: d.data().authorName || 'Unknown', trade: d.data().trade || '' })));
      } catch (e) {
        setError('Could not read the stories collection: ' + e.message);
      }
    })();
  }, []);

  const runPurge = async () => {
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'stories'));
      const ids = snap.docs.map((d) => d.id);
      let deleted = 0;
      for (let i = 0; i < ids.length; i += 450) {
        const batch = writeBatch(db);
        ids.slice(i, i + 450).forEach((id) => batch.delete(doc(db, 'stories', id)));
        await batch.commit();
        deleted += Math.min(450, ids.length - i);
      }
      setResult(deleted);
      setStories([]);
    } catch (e) {
      setError('Delete failed. Your Firestore rules may forbid deleting other users\' stories — ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle size={18} />
          <h1 className="font-display text-lg font-extrabold">Purge demo stories</h1>
        </div>
        <p className="mt-2 text-sm text-amber-800/80">
          Deletes <strong>all</strong> documents in the Firestore <code>stories</code> collection.
          Signed in as <strong>{currentUser?.email || 'unknown'}</strong>. This is irreversible.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {stories === null && !error && (
          <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> Loading stories...</div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {stories && (
          <>
            <p className="text-sm font-bold text-gray-900">
              {stories.length} story {stories.length === 1 ? 'document' : 'documents'} found:
            </p>
            {stories.length > 0 && (
              <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                {stories.map((s) => (
                  <li key={s.id} className="truncate"><span className="font-semibold text-gray-800">{s.name}</span>{s.trade ? ` · ${s.trade}` : ''}</li>
                ))}
              </ul>
            )}
            {stories.length > 0 ? (
              <button
                onClick={runPurge}
                disabled={busy}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {busy && <Loader2 size={15} className="animate-spin" />}
                {busy ? 'Deleting...' : `Delete all ${stories.length} demo stories`}
              </button>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={16} /> No story documents remain.
              </p>
            )}
            {result !== null && (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={16} /> Deleted {result} story {result === 1 ? 'document' : 'documents'}.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
