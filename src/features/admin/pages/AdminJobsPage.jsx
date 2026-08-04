import { useState, useEffect, useMemo } from 'react';
import { Briefcase, ChevronDown, ChevronUp, Ban, Scale, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/features/admin/components/PageHeader';
import FilterTabs from '@/features/admin/components/FilterTabs';
import StatusBadge from '@/features/admin/components/StatusBadge';
import ConfirmDialog from '@/features/admin/components/ConfirmDialog';
import { subscribeToJobs, subscribeToUsers, adminCancelJob, adminResolveDispute } from '@/services/adminService';
import { timeAgo } from '@/utils/time';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => subscribeToJobs(setJobs), []);
  useEffect(() => subscribeToUsers(setUsers), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const nameMap = useMemo(() => {
    const map = {};
    users.forEach((u) => { map[u.id] = u.displayName || u.email || u.id; });
    return map;
  }, [users]);

  const counts = useMemo(() => {
    const c = { all: jobs.length };
    jobs.forEach((j) => { c[j.status] = (c[j.status] || 0) + 1; });
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filter !== 'all' && j.status !== filter) return false;
      if (!q) return true;
      return (j.title || '').toLowerCase().includes(q) || (j.description || '').toLowerCase().includes(q) || (nameMap[j.clientId] || '').toLowerCase().includes(q) || (nameMap[j.handymanId] || '').toLowerCase().includes(q);
    });
  }, [jobs, search, filter, nameMap]);

  const doCancel = async () => {
    setBusy(true);
    try { await adminCancelJob(confirm.id); setToast('Job cancelled'); } catch { setToast('Failed to cancel job'); }
    finally { setBusy(false); setConfirm(null); }
  };

  const doResolve = async () => {
    setBusy(true);
    try { await adminResolveDispute(confirm.id); setToast('Dispute resolved'); } catch { setToast('Failed to resolve dispute'); }
    finally { setBusy(false); setConfirm(null); }
  };

  const confirmedJob = jobs.find((j) => j.id === confirm?.id);

  return (
    <div className="mx-auto max-w-7xl font-sans text-gray-900 dark:text-gray-100">
      <PageHeader
        title="All Platform Jobs"
        subtitle={`${counts.all} jobs posted across the platform.`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          aria-label="Search jobs"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-900"
        />
        <FilterTabs
          tabs={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'open', label: 'Open', count: counts.open || 0 },
            { key: 'assigned', label: 'Assigned', count: counts.assigned || 0 },
            { key: 'completed', label: 'Completed', count: counts.completed || 0 },
            { key: 'disputed', label: 'Disputed', count: counts.disputed || 0 },
            { key: 'cancelled', label: 'Cancelled', count: counts.cancelled || 0 },
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
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Handyman</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Budget</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Posted</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  clientName={nameMap[job.clientId] || job.clientId?.slice(0, 8)}
                  handymanName={job.handymanName || nameMap[job.handymanId] || '—'}
                  expanded={expandedId === job.id}
                  onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                  onCancel={() => setConfirm({ id: job.id, action: 'cancel' })}
                  onResolve={() => setConfirm({ id: job.id, action: 'resolve' })}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No jobs match your filters.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === 'cancel' ? 'Cancel this job?' : 'Resolve this dispute?'}
        message={confirm?.action === 'cancel'
          ? `"${confirmedJob?.title || 'This job'}" will be marked as cancelled and removed from active listings.`
          : `Mark "${confirmedJob?.title || 'this job'}"'s dispute as resolved and reopen it.`}
        confirmLabel={confirm?.action === 'cancel' ? 'Cancel job' : 'Resolve'}
        danger={confirm?.action === 'cancel'}
        loading={busy}
        onConfirm={confirm?.action === 'cancel' ? doCancel : doResolve}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function JobRow({ job, clientName, handymanName, expanded, onToggle, onCancel, onResolve }) {
  return (
    <>
      <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-6 py-4">
          <div className="max-w-md">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{job.title}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{job.category || 'General'} {job.location ? `· ${job.location}` : ''}</p>
          </div>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{clientName}</td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{handymanName}</td>
        <td className="whitespace-nowrap px-6 py-4">
          <span className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
            <DollarSign size={14} /> {Number(job.budget) || 0}
          </span>
        </td>
        <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={job.status} /></td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
          {job.createdAt ? timeAgo(job.createdAt) : '—'}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {job.status === 'disputed' && (
              <button onClick={onResolve} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20">
                <Scale size={13} /> Resolve
              </button>
            )}
            {(job.status === 'open' || job.status === 'assigned') && (
              <button onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20">
                <Ban size={13} /> Cancel
              </button>
            )}
            <button onClick={onToggle} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/60 dark:bg-gray-800/40">
          <td colSpan={7} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{job.description || 'No description provided.'}</p>
                <h4 className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">Timeline</h4>
                <div className="space-y-1.5">
                  {(job.timeline || []).slice().reverse().map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
                      <span className="font-medium capitalize">{t.label}</span>
                      <span className="text-gray-400">{format(t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt), 'dd MMM, HH:mm')}</span>
                    </div>
                  ))}
                  {(job.timeline || []).length === 0 && <p className="text-xs text-gray-400">No timeline events.</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">Details</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {job.location || 'No location'}</p>
                    <p>Quotes: {job.quotes?.length || 0}</p>
                    <p>Milestones: {job.milestones?.length || 0}</p>
                    <p>Job ID: <span className="font-mono text-xs">{job.id.slice(0, 16)}...</span></p>
                  </div>
                </div>
                {job.dispute && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-500/20 dark:bg-red-500/10">
                    <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-red-500">Dispute</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{job.dispute.reason}</p>
                    <p className="mt-1 text-[11px] text-red-500">Opened by {job.dispute.openedBy} · {job.dispute.status}</p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
