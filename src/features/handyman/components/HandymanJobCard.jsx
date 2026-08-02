import { useState } from 'react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronDown,
  MapPin,
  Star,
  BadgeCheck,
  Phone,
  MessageCircle,
  Play,
  CheckCircle2,
  CircleDollarSign,
  Navigation,
  Clock,
  CalendarClock,
  FileText,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { STATUS_META, deriveJobStatus } from '@/features/handyman/constants/jobStatus';

const toDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : value ? new Date(value) : null);

const timeAgo = (value) => {
  const d = toDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '';
};

const money = (value) => (value != null && !Number.isNaN(Number(value)) ? `$${Number(value)}` : '—');

const TIMELINE_META = {
  posted: { icon: FileText, cls: 'text-gray-500' },
  quote: { icon: CircleDollarSign, cls: 'text-blue-500' },
  progress: { icon: Play, cls: 'text-orange-500' },
  milestone: { icon: CheckCircle2, cls: 'text-purple-500' },
  dispute: { icon: Clock, cls: 'text-red-500' },
};

const MILESTONES = ['Posted', 'Accepted', 'Started', 'Completed', 'Paid'];

const milestoneIndex = (job) => {
  if (job.paid) return 5;
  if (job.status === 'completed' || job.status === 'disputed') return 4;
  if (Number(job.progress) > 0 || job.startedAt) return 3;
  if (job.status === 'assigned') return 2;
  return 1;
};

const ActionButton = ({ onClick, disabled, icon: Icon, label, tone = 'neutral', className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50',
      tone === 'primary' && 'bg-orange-500 text-white hover:bg-orange-600',
      tone === 'success' && 'bg-emerald-500 text-white hover:bg-emerald-600',
      tone === 'purple' && 'bg-purple-500 text-white hover:bg-purple-600',
      tone === 'neutral' && 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
      className
    )}
  >
    <Icon size={14} /> {label}
  </button>
);

export default function HandymanJobCard({ job, client, onStart, onComplete, onRequestPayment, onUpdateProgress, onChat, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const [progressValue, setProgressValue] = useState(Number(job.progress) || 0);
  const [savingProgress, setSavingProgress] = useState(false);

  const status = deriveJobStatus(job);
  const meta = STATUS_META[status] || STATUS_META.open;
  const clientName = client?.displayName || client?.name || 'Client';
  const rating = client?.rating;
  const area = client?.address || job?.location || 'Harare, ZW';
  const startedAt = job?.startedAt || job?.timeline?.find((t) => t.type === 'progress')?.createdAt;
  const progress = Number(job.progress) || 0;

  const updateProgress = async (value) => {
    setSavingProgress(true);
    try {
      await onUpdateProgress(job, value);
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: client + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={client?.photoURL} name={clientName} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-gray-900">{clientName}</p>
              {client?.verified && <BadgeCheck size={15} className="shrink-0 text-blue-500" />}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              {rating ? (
                <>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{Number(rating).toFixed(1)}</span>
                </>
              ) : (
                <span>New client</span>
              )}
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-0.5"><MapPin size={10} /> {area}</span>
            </div>
          </div>
        </div>
        <span className={clsx('flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1', meta.chip)}>
          <span className={clsx('h-1.5 w-1.5 rounded-full', meta.dot)} /> {meta.label}
        </span>
      </div>

      {/* Title */}
      <p className="mt-3 font-display text-base font-bold text-gray-900">{job.title || 'Untitled job'}</p>

      {/* Meta chips */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{money(job.budget)}</span>
        {job.createdAt && <span className="flex items-center gap-1"><CalendarClock size={12} /> Posted {timeAgo(job.createdAt)}</span>}
        {startedAt && <span className="flex items-center gap-1"><Play size={12} /> Started {timeAgo(startedAt)}</span>}
      </div>

      {/* Progress bar */}
      {status === 'in_progress' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <p className={clsx('mt-2.5 text-xs leading-relaxed text-gray-500', !expanded && 'line-clamp-2')}>{job.description}</p>
      )}

      {/* Primary actions */}
      <div className="mt-4 flex items-center gap-2">
        {status === 'accepted' && <ActionButton tone="primary" icon={Play} label="Start Work" onClick={() => onStart(job)} className="flex-1" />}
        {status === 'in_progress' && <ActionButton tone="success" icon={CheckCircle2} label="Complete Job" onClick={() => onComplete(job)} className="flex-1" />}
        {status === 'awaiting_payment' && <ActionButton tone="purple" icon={CircleDollarSign} label="Request Payment" onClick={() => onRequestPayment(job)} className="flex-1" />}
        <ActionButton icon={MessageCircle} label="Chat" onClick={() => onChat(job)} />
        <ActionButton icon={Navigation} label="Navigate" onClick={() => onNavigate(job)} />
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
        >
          <ChevronDown size={16} className={clsx('transition-transform', expanded && 'rotate-180')} />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Milestones */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Job timeline</p>
            <div className="mt-2.5 flex items-center">
              {MILESTONES.map((step, i) => {
                const reached = i < milestoneIndex(job);
                return (
                  <div key={step} className={clsx('flex items-center', i < MILESTONES.length - 1 && 'flex-1')}>
                    <div className="flex flex-col items-center">
                      <span
                        className={clsx(
                          'flex h-6 w-6 items-center justify-center rounded-full border-2 text-[9px] font-bold',
                          reached ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 bg-white text-gray-400'
                        )}
                      >
                        {reached ? '✓' : i + 1}
                      </span>
                      <span className={clsx('mt-1 text-[9px] font-semibold', reached ? 'text-gray-700' : 'text-gray-400')}>{step}</span>
                    </div>
                    {i < MILESTONES.length - 1 && (
                      <div className={clsx('mx-1 mb-4 h-0.5 flex-1 rounded-full', i < milestoneIndex(job) - 1 ? 'bg-orange-500' : 'bg-gray-200')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline events */}
          {job.timeline?.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Updates</p>
              {job.timeline.map((t, i) => {
                const tMeta = TIMELINE_META[t.type] || TIMELINE_META.posted;
                const Icon = tMeta.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon size={15} className={clsx('mt-0.5 shrink-0', tMeta.cls)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-700">{t.label}</p>
                      <p className="text-[10px] text-gray-400">{timeAgo(t.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Client contact */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-3">
            <FileText size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">{area}</span>
            {client?.phone && (
              <a href={`tel:${client.phone}`} className="ml-auto flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50">
                <Phone size={12} className="text-emerald-500" /> {client.phone}
              </a>
            )}
          </div>

          {/* Progress control */}
          {status === 'in_progress' && (
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700">Update progress</p>
                <span className="text-xs font-bold text-orange-600">{progressValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                className="mt-2 w-full accent-orange-500"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setProgressValue(progress)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100">
                  Reset
                </button>
                <button
                  onClick={() => updateProgress(progressValue)}
                  disabled={savingProgress || progressValue === progress}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {savingProgress ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
