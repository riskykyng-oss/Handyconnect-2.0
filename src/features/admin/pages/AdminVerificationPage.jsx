import { useState, useEffect, useMemo } from 'react';
import { BadgeCheck, BadgeX } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/features/admin/components/PageHeader';
import FilterTabs from '@/features/admin/components/FilterTabs';
import StatusBadge from '@/features/admin/components/StatusBadge';
import ConfirmDialog from '@/features/admin/components/ConfirmDialog';
import { subscribeToUsers, adminSetVerified } from '@/services/adminService';

export default function AdminVerificationPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);
  const [toReject, setToReject] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => subscribeToUsers(setUsers), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const pros = useMemo(() => users.filter((u) => u.role === 'handyman'), [users]);
  const pending = useMemo(() => pros.filter((u) => u.verifiedRequest === 'pending'), [pros]);
  const unverified = useMemo(() => pros.filter((u) => !u.verified), [pros]);

  const list = filter === 'pending' ? pending : unverified;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) => (u.displayName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.skills || '').toLowerCase().includes(q));
  }, [list, search]);

  const approve = async (uid) => {
    setBusyId(uid);
    try { await adminSetVerified(uid, true); setToast('Badge approved'); } catch { setToast('Failed to approve'); }
    finally { setBusyId(null); }
  };

  const reject = async () => {
    setBusyId(toReject);
    try { await adminSetVerified(toReject, false); setToast('Request rejected'); } catch { setToast('Failed to reject'); }
    finally { setBusyId(null); setToReject(null); }
  };

  return (
    <div className="mx-auto max-w-7xl font-sans text-gray-900 dark:text-gray-100">
      <PageHeader
        title="Verification Requests"
        subtitle={`${pending.length} pending · ${unverified.length} professionals not yet verified.`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          aria-label="Search professionals"
          placeholder="Search name, email or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-900"
        />
        <FilterTabs
          tabs={[
            { key: 'pending', label: 'Pending requests', count: pending.length },
            { key: 'unverified', label: 'All unverified', count: unverified.length },
          ]}
          active={filter}
          onChange={setFilter}
        />
      </div>

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Professional</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Skills</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Joined</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                        {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : (user.displayName || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.displayName || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.skills || user.trade || '—'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.createdAt ? format(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.verified ? <StatusBadge status="verified">Verified</StatusBadge> : user.verifiedRequest === 'pending' ? <StatusBadge status="pending">Pending</StatusBadge> : <StatusBadge status="pending">Not verified</StatusBadge>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => approve(user.id)}
                        disabled={busyId === user.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      >
                        <BadgeCheck size={13} /> Approve
                      </button>
                      <button
                        onClick={() => setToReject(user.id)}
                        disabled={busyId === user.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        <BadgeX size={13} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{filter === 'pending' ? 'No pending verification requests.' : 'All professionals are verified.'}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toReject}
        title="Reject this verification?"
        message="The professional will stay active but without the verified badge. They can re-apply later."
        confirmLabel="Reject request"
        loading={busyId === toReject}
        onConfirm={reject}
        onCancel={() => setToReject(null)}
      />
    </div>
  );
}
