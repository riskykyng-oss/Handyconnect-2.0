import clsx from 'clsx';

export default function SectionCard({ title, subtitle, action, children, className, bodyClassName }) {
  return (
    <div className={clsx('rounded-xl border border-black/[0.07] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900', className)}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            {title && <h2 className="text-base font-semibold tracking-tight text-hc-ink dark:text-white">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={clsx('px-5 pb-5', bodyClassName)}>{children}</div>
    </div>
  );
}
