import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, ArrowRight, Loader2, Check, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { subscribeProfessionals } from '@/services/userService';

const headers = {
  login: {
    title: 'Welcome back',
    desc: 'Sign in to manage projects, jobs and your community.',
  },
  signup: {
    title: 'Create your account',
    desc: 'Join local clients and professionals on HandyConnect.',
  },
  reset: {
    title: 'Reset your password',
    desc: "Enter your email and we'll send you a secure reset link.",
  },
};

// Bright construction-site shot (residential build under way) — portrait crop, not a cluttered scene.
const heroImage = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&h=1200&q=85';
const heroHeadline = 'Find trusted professionals in minutes.';
const heroSubtitle =
  'From plumbing and electrical work to painting and renovations, HandyConnect connects you with verified experts across Zimbabwe.';

const whyItems = [
  'Hire verified professionals',
  'Track every job in real time',
  'Pay securely via QR code',
  'Message directly in the app',
];

// Live, real numbers from the platform — no seed placeholders.
function useMarketStats() {
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const unsub = subscribeProfessionals(setPros);
    return unsub;
  }, []);

  const jobs = pros.reduce((sum, p) => sum + (typeof p.jobs === 'number' ? p.jobs : 0), 0);
  const ratings = pros.map((p) => p.rating).filter((r) => typeof r === 'number');
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  return { professionals: pros.length, jobs, avgRating };
}

function BrandMark({ light }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hc-brand text-[13px] font-medium text-white shadow-sm">
        HC
      </span>
      <span className={`font-display text-lg font-medium tracking-tight ${light ? 'text-white' : 'text-hc-ink'}`}>
        Handy<span className="text-hc-brand">Connect</span>
      </span>
    </span>
  );
}

function BrandPanel() {
  const { professionals, jobs, avgRating } = useMarketStats();
  const [imgFailed, setImgFailed] = useState(false);

  const stats = [];
  if (professionals > 0) {
    stats.push({
      value: professionals.toLocaleString(),
      label: professionals === 1 ? 'Local professional' : 'Local professionals',
    });
  }
  if (jobs > 0) {
    stats.push({ value: `${jobs.toLocaleString()}+`, label: 'Jobs completed' });
  }
  if (avgRating != null) {
    stats.push({ value: `${avgRating.toFixed(1)}/5`, label: 'Customer rating' });
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Solid fallback so the panel never renders a broken image */}
      <div className="absolute inset-0 bg-hc-page" aria-hidden="true" />
      {!imgFailed && (
        <img
          src={heroImage}
          alt="A verified HandyConnect professional at work"
          width={900}
          height={1200}
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/0" />

      <div className="absolute inset-x-0 bottom-0 max-h-full space-y-4 overflow-y-auto p-10 text-white xl:p-14">
        <h2 className="font-display text-[28px] font-medium leading-[1.12] tracking-tight text-white xl:text-[34px]">
          {heroHeadline}
        </h2>
        <p className="max-w-md text-[15px] leading-relaxed text-white/80">{heroSubtitle}</p>

        {avgRating != null && (
          <div className="flex items-center gap-2 pt-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-white/25 text-white/25'}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-white">{avgRating.toFixed(1)}/5</span>
            <span className="text-sm text-white/70">· Trusted across Zimbabwe</span>
          </div>
        )}

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {stats.map((s) => (
              <div key={s.label} className="min-w-[120px] flex-1 rounded-lg border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-sm">
                <div className="font-display text-xl font-medium text-white">{s.value}</div>
                <div className="mt-1 text-[13px] leading-snug text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-white/15 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">Why HandyConnect?</p>
          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
            {whyItems.map((item) => (
              <span key={item} className="flex items-center gap-2 text-[13px] text-white/75">
                <Check size={13} strokeWidth={3} className="shrink-0 text-hc-brand" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthShell({ children, mode = 'login', noHeader = false }) {
  const reducedMotion = useReducedMotion();
  const header = headers[mode];

  return (
    <div className="flex min-h-screen bg-hc-page">
      {/* ── LEFT: brand panel (desktop only) ── */}
      <aside className="hidden w-1/2 lg:block">
        <BrandPanel />
      </aside>

      {/* ── RIGHT: full-height white form column ── */}
      <main className="flex w-full flex-col bg-white lg:w-1/2">
        <header className="px-5 pb-3 pt-5 sm:px-8 lg:px-10">
          <Link to="/" className="inline-flex">
            <BrandMark />
          </Link>
          <p className="mt-1.5 text-sm text-hc-ink-2 lg:hidden">Local pros, trusted work, one community.</p>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-[420px]"
          >
            {!noHeader && (
              <div className="mb-6">
                <h1 className="font-display text-[30px] font-medium tracking-tight text-hc-ink">{header.title}</h1>
                <p className="mt-2 text-[15px] leading-6 text-hc-ink-2">{header.desc}</p>
              </div>
            )}
            {children}
            {mode !== 'signup' && (
              <p className="mt-6 text-center text-[12px] leading-relaxed text-hc-ink-3">
                Protected by Firebase Authentication · Encrypted connection
              </p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────── Shared form primitives ─────────────────────────── */

export function TextField({ id, label, type = 'text', rightLink, error, invalid, className = '', ...props }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  const resolvedType = isPw && show ? 'text' : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-hc-ink">
          {label}
        </label>
        {rightLink}
      </div>
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          aria-invalid={!!invalid}
          className={`h-11 w-full rounded-lg border-[0.5px] bg-white px-3.5 text-[15px] text-hc-ink outline-none transition-colors placeholder:text-hc-ink-3 ${
            invalid
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-hc-hairline focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/30'
          } ${isPw ? 'pr-11' : ''} ${className}`}
          {...props}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-hc-ink-3 transition-colors hover:text-hc-ink"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function AuthButton({ loading, loadingText = 'Please wait…', type = 'submit', children, ...props }) {
  return (
    <button
      type={type}
      disabled={loading}
      {...props}
      className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-hc-brand px-5 text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-hc-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 size={17} className="animate-spin" />
          {loadingText}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {children}
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      )}
    </button>
  );
}

export function SocialDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-hc-hairline" />
      <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-hc-ink-3">Continue with</span>
      <div className="h-px flex-1 bg-hc-hairline" />
    </div>
  );
}

const socialBtnClass =
  'flex h-11 w-full items-center justify-center gap-3 rounded-lg border-[0.5px] border-hc-hairline bg-white text-sm font-medium text-hc-ink transition-colors hover:border-hc-ink-3 hover:bg-hc-page';

export function SocialButtons() {
  const [more, setMore] = useState(false);
  const buttons = [
    { icon: <GoogleIcon />, label: 'Continue with Google' },
    { icon: <AppleIcon />, label: 'Continue with Apple' },
    { icon: <MicrosoftIcon />, label: 'Continue with Microsoft' },
  ];
  const [primary, ...rest] = buttons;

  return (
    <div className="space-y-2.5">
      <button type="button" className={socialBtnClass}>
        {primary.icon}
        {primary.label}
      </button>

      {rest.map((b) => (
        <button
          key={b.label}
          type="button"
          className={`${socialBtnClass} ${more ? 'flex' : 'hidden'} sm:flex`}
        >
          {b.icon}
          {b.label}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setMore((v) => !v)}
        aria-expanded={more}
        className="flex h-9 w-full items-center justify-center gap-1 text-[13px] font-medium text-hc-ink-2 transition-colors hover:text-hc-brand sm:hidden"
      >
        <ChevronDown size={14} className={`transition-transform duration-200 ${more ? 'rotate-180' : ''}`} />
        {more ? 'Less options' : 'More options'}
      </button>
    </div>
  );
}

export function AuthCheckbox({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked ? 'border-hc-brand bg-hc-brand text-white' : 'border-hc-ink-3 bg-white hover:border-hc-brand'
        }`}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </button>
      <span className="text-sm leading-relaxed text-hc-ink-2">{children}</span>
    </label>
  );
}

export function FormAlert({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-5 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-600"
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Social brand icons ─────────────────────────── */

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5a4.7 4.7 0 0 1-2 3.1v2.4h3.2c1.9-1.8 3.1-4.3 3.1-7.2Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.4c-.9.6-2 .9-3.5.9-2.6 0-4.8-1.7-5.6-4.1H3.1v2.5A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.6H3.1a10 10 0 0 0 3.3 8.4l3.3-2.1Z" />
      <path fill="#EA4335" d="M12 6c1.5 0 2.9.5 3.9 1.5l2.9-2.8A10 10 0 0 0 3.1 7.6l3.3 2.5C7.2 7.7 9.4 6 12 6Z" />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <rect x="3" y="3" width="8.5" height="8.5" fill="#F25022" />
      <rect x="12.5" y="3" width="8.5" height="8.5" fill="#7FBA00" />
      <rect x="3" y="12.5" width="8.5" height="8.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#FFB900" />
    </svg>
  );
}
