import { useState, useEffect, useMemo } from 'react';
import { Users, ShieldOff, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/features/admin/components/PageHeader';
import FilterTabs from '@/features/admin/components/FilterTabs';
import StatusBadge from '@/features/admin/components/StatusBadge';
import { subscribeToUsers, adminUpdateUserRole, adminSetUserSuspended } from '@/services/adminService';

const ROLE_OPTIONS = ['client', 'handyman', 'admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => subscribeToUsers(setUsers), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => ({
    all: users.length,
    client: users.filter((u) => u.role === 'client').length,
    handyman: users.filter((u) => u.role === 'handyman').length,
    admin: users.filter((u) => u.role === 'admin').length,
    suspended: users.filter((u) => u.suspended).length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === 'suspended' && !u.suspended) return false;
      if (filter !== 'suspended' && filter !== 'all' && u.role !== filter) return false;
      if (!q) return true;
      return (u.email || '').toLowerCase().includes(q) || (u.displayName || '').toLowerCase().includes(q) || u.id.includes(q);
    });
  }, [users, search, filter]);

  const changeRole = async (uid, role) => {
    setBusyId(uid);
    try { await adminUpdateUserRole(uid, role); setToast('Role updated'); } catch { setToast('Failed to update role'); }
    finally { setBusyId(null); }
  };

  const toggleSuspend = async (user) => {
    setBusyId(user.id);
    try { await adminSetUserSuspended(user.id, !user.suspended); setToast(user.suspended ? 'User reactivated' : 'User suspended'); }
    catch { setToast('Failed to update status'); }
    finally { setBusyId(null); }
  };

  return (
    <div className="mx-auto max-w-7xl font-sans text-gray-900 dark:text-gray-100">
      <PageHeader
        title="Platform Users"
        subtitle={`${counts.all} registered accounts — clients, handymen and admins.`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          aria-label="Search users"
          placeholder="Search name, email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-900"
        />
        <FilterTabs
          tabs={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'client', label: 'Clients', count: counts.client },
            { key: 'handyman', label: 'Handymen', count: counts.handyman },
            { key: 'admin', label: 'Admins', count: counts.admin },
            { key: 'suspended', label: 'Suspended', count: counts.suspended },
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

      <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
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
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      value={user.role || 'pending'}
                      disabled={busyId === user.id}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className={`rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold outline-none transition-colors focus:border-orange-400 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${user.role === 'admin' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      {ROLE_OPTIONS.includes(user.role) ? ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>) : <option value="pending">pending</option>}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.createdAt ? format(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.suspended ? <StatusBadge status="suspended">Suspended</StatusBadge> : <StatusBadge status="active">Active</StatusBadge>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleSuspend(user)}
                        disabled={busyId === user.id}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                          user.suspended
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400'
                        }`}
                      >
                        {user.suspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                        {user.suspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No users match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
