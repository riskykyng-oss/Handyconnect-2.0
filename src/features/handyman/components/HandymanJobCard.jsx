import { useEffect, useState } from 'react';
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
  Timer,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { STATUS_META, deriveJobStatus } from '@/features/handyman/constants/jobStatus';

const PLATFORM_FEE_RATE = 0.1;

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

const Stars = ({ rating }) => {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= rounded ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
      <span className="ml-1 text-xs font-bold text-gray-800">{Number(rating).toFixed(1)}</span>
    </span>
  );
};

const Elapsed = ({ since }) => {
  const start = toDate(since)?.getTime();
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!start) return undefined;
    const tick = () => setMs(Date.now() - start);
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [start]);
  if (!start) return null;
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return (
    <>
      {h}h {m}m
    </>
  );
};

const haversineKm = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const km = R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

const ActionButton = ({ onClick, disabled, icon: Icon, label, tone = 'neutral', className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      'flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-colors disabled:opacity-50',
      tone === 'primary' && 'bg-orange-500 text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600',
      tone === 'success' && 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600',
      tone === 'purple' && 'bg-purple-500 text-white shadow-sm shadow-purple-500/20 hover:bg-purple-600',
      tone === 'ghost' && 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300',
      className
    )}
  >
    <Icon size={14} /> {label}
  </button>
);

export default function HandymanJobCard({ job, client, userLocation, onStart, onComplete, onRequestPayment, onUpdateProgress, onChat, onNavigate }) {
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

  const budget = Number(job.budget) || 0;
  const fee = Math.round(budget * PLATFORM_FEE_RATE * 100) / 100;
  const net = Math.max(0, budget - fee);
  const showNet = budget > 0;

  const distance =
    client?.location?.lat != null && userLocation?.lat != null
      ? haversineKm({ lat: client.location.lat, lng: client.location.lng }, { lat: userLocation.lat, lng: userLocation.lng })
      : null;

  const updateProgress = async (value) => {
    setSavingProgress(true);
    try {
      await onUpdateProgress(job, value);
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md">
      {/* Header: client + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={client?.photoURL} name={clientName} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-gray-900">{clientName}</p>
              {client?.verified && <BadgeCheck size={15} className="shrink-0 text-blue-500" />}
            </div>
            <div className="mt-1 flex items-center">
              {rating ? <Stars rating={rating} /> : <span className="text-[11px] font-medium text-gray-400">New client</span>}
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin size={11} className="text-gray-400" />
              {distance ? `${distance} away` : area}
            </p>
          </div>
        </div>
        <span className={clsx('flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1', meta.chip)}>
          <span className={clsx('h-1.5 w-1.5 rounded-full', meta.dot)} /> {meta.label}
        </span>
      </div>

      <div className="my-4 border-t border-gray-100" />

      {/* Trade + title + description */}
      {job.category && (
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600">{job.category}</p>
      )}
      <h3 className="mt-1 font-display text-base font-extrabold text-gray-900">{job.title || 'Untitled job'}</h3>
      {job.description && (
        <p className={clsx('mt-1.5 text-xs leading-relaxed text-gray-500', !expanded && 'line-clamp-2')}>{job.description}</p>
      )}

      <div className="my-4 border-t border-gray-100" />

      {/* Budget + posted / elapsed */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Budget</p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-gray-900">{money(job.budget)}</p>
          {showNet && (
            <p className="mt-0.5 text-[10px] text-gray-400">
              You'll receive <span className="font-bold text-gray-600">{money(net)}</span>
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{startedAt ? 'Started' : 'Posted'}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-gray-700">
            {startedAt ? <Timer size={12} className="text-orange-500" /> : <CalendarClock size={12} className="text-gray-400" />}
            {startedAt ? <Elapsed since={startedAt} /> : timeAgo(job.createdAt)}
          </p>
          {startedAt && <p className="mt-0.5 text-[10px] text-gray-400">elapsed</p>}
        </div>
      </div>

      {/* Progress bar */}
      {status === 'in_progress' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-gray-100" />

      {/* Actions */}
      <div className="mt-4 flex items-stretch gap-2">
        {status === 'accepted' && (
          <ActionButton tone="primary" icon={Play} label="Start Work" onClick={() => onStart(job)} className="flex-1" />
        )}
        {status === 'in_progress' && (
          <ActionButton tone="success" icon={CheckCircle2} label="Complete Job" onClick={() => onComplete(job)} className="flex-1" />
        )}
        {status === 'awaiting_payment' && (
          <ActionButton tone="purple" icon={CircleDollarSign} label="Request Payment" onClick={() => onRequestPayment(job)} className="flex-1" />
        )}
        <ActionButton tone="ghost" icon={MessageCircle} label="Chat" onClick={() => onChat(job)} />
        <ActionButton tone="ghost" icon={Navigation} label="Navigate" onClick={() => onNavigate(job)} />
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
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

          {/* Earnings breakdown */}
          {showNet && (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Estimated earnings</p>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Job budget</span>
                  <span className="font-semibold text-gray-900">{money(budget)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Platform fee (10%)</span>
                  <span className="font-semibold text-red-500">−{money(fee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-1.5">
                  <span className="font-bold text-gray-700">You'll receive</span>
                  <span className="font-extrabold text-emerald-600">{money(net)}</span>
                </div>
              </div>
            </div>
          )}

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
              <a href={`tel:${client.phone}`} className="ml-auto flex h-11 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50">
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
                <button onClick={() => setProgressValue(progress)} className="flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-500 shadow-sm transition-colors hover:bg-gray-100">
                  Reset
                </button>
                <button
                  onClick={() => updateProgress(progressValue)}
                  disabled={savingProgress || progressValue === progress}
                  className="flex h-11 items-center justify-center rounded-xl bg-orange-500 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50"
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
