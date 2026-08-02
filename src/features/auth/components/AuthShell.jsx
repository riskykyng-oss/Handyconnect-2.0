import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Star, ArrowRight, Loader2, Check, Wrench, Zap, Home, Droplet, PaintBucket, Hammer } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const headers = {
  login: {
    title: 'Welcome Back',
    desc: 'Continue managing projects, hiring professionals and growing your business.',
  },
  signup: {
    title: 'Create your account',
    desc: 'Join thousands of clients and professionals using HandyConnect every day.',
  },
  reset: {
    title: 'Reset your password',
    desc: "We'll help you securely return to the work that matters.",
  },
};

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
    title: 'Find trusted professionals in minutes.',
    subtitle:
      'From plumbing and electrical work to painting and home renovations, HandyConnect connects you with verified experts across Zimbabwe.',
  },
  {
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    title: 'Grow your business with new opportunities every day.',
    subtitle: 'Get discovered by clients, build your portfolio and get paid securely.',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1200&q=80',
    title: "Join Zimbabwe's growing network of skilled professionals.",
    subtitle: 'Collaborate, share completed work and earn a reputation that travels.',
  },
];

const heroStats = [
  { value: 18000, suffix: '+', label: 'Professionals' },
  { value: 45000, suffix: '+', label: 'Jobs Completed' },
  { value: 98, suffix: '%', label: 'Customer Rating' },
];

const whyItems = [
  'Hire verified professionals',
  'Track every job in real time',
  'Pay securely via QR code',
  'Message directly in the app',
];

const floatingIcons = [
  { Icon: Wrench, left: '8%', top: '18%', size: 56, delay: 0 },
  { Icon: Zap, left: '80%', top: '12%', size: 64, delay: 0.6 },
  { Icon: Home, left: '10%', top: '60%', size: 60, delay: 1.1 },
  { Icon: Droplet, left: '84%', top: '64%', size: 52, delay: 0.3 },
  { Icon: PaintBucket, left: '48%', top: '7%', size: 58, delay: 0.9 },
  { Icon: Hammer, left: '64%', top: '82%', size: 56, delay: 1.4 },
];

function StatValue({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    let start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function BrandMark({ light }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#F97316] text-[13px] font-extrabold text-white shadow-md">
        HC
      </span>
      <span className={`font-display text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>
        Handy<span className="text-[#F97316]">Connect</span>
      </span>
    </span>
  );
}

function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Crossfading backgrounds */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <motion.img
            key={s.image}
            src={s.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: i === index ? 1 : 0, scale: [1, 1.06, 1] }}
            transition={{ opacity: { duration: 1.1 }, scale: { duration: 24, repeat: Infinity, ease: 'easeInOut' } }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/35 to-black/25" />

      {/* Faint floating tool icons */}
      {floatingIcons.map(({ Icon, left, top, size, delay }) => (
        <motion.div
          key={delay}
          className="absolute z-10 text-white"
          style={{ left, top }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.11, y: [0, -12, 0] }}
          transition={{ opacity: { duration: 0.8, delay }, y: { duration: 5 + delay, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </motion.div>
      ))}

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link to="/">
            <BrandMark light />
          </Link>
        </motion.div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2 className="font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white xl:text-[40px]">
                {slides[index].title}
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">{slides[index].subtitle}</p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-6 flex items-center gap-2"
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">4.9/5</span>
            <span className="text-sm text-white/70">· Trusted across Zimbabwe</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="mt-5 grid grid-cols-3 gap-3"
          >
            {heroStats.map((s) => (
              <div key={s.label} className="rounded-[20px] border border-white/15 bg-white/15 px-4 py-3.5 backdrop-blur-[15px]">
                <div className="font-display text-xl font-extrabold text-white xl:text-2xl">
                  <StatValue value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs leading-snug text-white/70">{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 border-t border-white/15 pt-5"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">Why HandyConnect?</p>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
              {whyItems.map((item) => (
                <span key={item} className="flex items-center gap-2 text-[13px] text-white/75">
                  <Check size={13} strokeWidth={3} className="shrink-0 text-[#F97316]" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function AuthShell({ children, mode = 'login', noHeader = false }) {
  const header = headers[mode];

  return (
    <div className="min-h-screen bg-[#F5F6F8] lg:flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── LEFT PANEL: dynamic hero (45%) ── */}
      <section className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[45%]">
        <HeroCarousel />
      </section>

      {/* ── RIGHT PANEL: auth card (55%) ── */}
      <section className="flex min-h-screen flex-1 justify-center bg-[#F5F6F8] px-4 pb-16 pt-20 sm:px-8 lg:w-[55%]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 w-full max-w-[480px]"
        >
          {/* Mobile brand */}
          <div className="mb-6 flex justify-center lg:hidden">
            <Link to="/">
              <BrandMark />
            </Link>
          </div>

          {/* Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="rounded-[32px] border border-white/70 bg-white/[0.94] p-7 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-[20px] sm:p-10"
          >
            {!noHeader && (
              <motion.div variants={childVariants}>
                <h1 className="font-display text-[36px] font-extrabold leading-[1.1] tracking-[-0.03em] text-gray-900 sm:text-[40px]">
                  {header.title}
                </h1>
                <p className="mt-8 text-[15px] leading-relaxed text-gray-500">{header.desc}</p>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={noHeader ? '' : 'mt-8'}
            >
              {children}
            </motion.div>
          </motion.div>

          <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
            Protected by Firebase Authentication · Encrypted Connection · Privacy First
          </p>
        </motion.div>
      </section>
    </div>
  );
}

/* ─────────────────────────── Shared form primitives ─────────────────────────── */

export function Field({ label, htmlFor, right, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-900">
          {label}
        </label>
        {right}
      </div>
      {children}
    </div>
  );
}

export function AuthInput({ right, invalid, className = '', id, ...props }) {
  return (
    <div className="group relative">
      <input
        id={id}
        {...props}
        className={`h-[60px] w-full rounded-[16px] border text-[15px] text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 ${
          'pl-5'
        } ${right ? 'pr-12' : 'pr-4'} ${
          invalid
            ? 'border-red-300 bg-[#FAFAFA] focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]'
            : 'border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#F97316]/40 focus:border-[#F97316] focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)]'
        } ${className}`}
      />
      {right && <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

export function AuthButton({ loading, loadingText, type = 'submit', children, ...props }) {
  return (
    <motion.button
      type={type}
      {...props}
      whileHover={loading ? undefined : { y: -2 }}
      whileTap={loading ? undefined : { scale: 0.98 }}
      className="group flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#F97316] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(249,115,22,0.3)] transition-all duration-200 hover:bg-[#EA580C] hover:shadow-[0_16px_32px_rgba(234,88,12,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 size={18} className="animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {children}
          <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      )}
    </motion.button>
  );
}

export function SocialDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-[#E5E7EB]" />
      <span className="text-xs font-medium tracking-[0.16em] text-gray-400">Continue with</span>
      <div className="h-px flex-1 bg-[#E5E7EB]" />
    </div>
  );
}

export function SocialButtons() {
  const buttons = [
    { icon: <GoogleIcon />, label: 'Continue with Google' },
    { icon: <AppleIcon />, label: 'Continue with Apple' },
    { icon: <MicrosoftIcon />, label: 'Continue with Microsoft' },
  ];
  return (
    <div className="space-y-3">
      {buttons.map((b) => (
        <motion.button
          key={b.label}
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex h-[60px] w-full items-center justify-center gap-3 rounded-[16px] border border-[#ECECEC] bg-white text-[15px] font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-[#F8F8F8] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
        >
          {b.icon}
          {b.label}
        </motion.button>
      ))}
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
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
          checked
            ? 'border-[#F97316] bg-[#F97316] text-white shadow-sm'
            : 'border-[#D1D5DB] bg-white hover:border-[#F97316]'
        }`}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          >
            <Check size={13} strokeWidth={3} />
          </motion.div>
        )}
      </button>
      <span className="text-sm leading-relaxed text-gray-500">{children}</span>
    </label>
  );
}

export function FormAlert({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mb-5 flex gap-2.5 rounded-[16px] border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600"
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
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
      <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.6H3.1A10 10 0 0 0 3.1 16l3.3-2.1Z" />
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
