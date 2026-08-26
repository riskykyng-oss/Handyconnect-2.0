import clsx from 'clsx';
const variants = {
  neutral: 'bg-hc-brand-100 text-hc-ink-2',
  primary: 'bg-hc-brand-100 text-hc-brand-strong',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
};
export default function Badge({ children, variant = 'neutral', className }) {
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', variants[variant], className)}>{children}</span>;
}
