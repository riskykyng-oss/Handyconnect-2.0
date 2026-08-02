import clsx from 'clsx';

export default function SectionCard({ title, subtitle, action, children, className, bodyClassName }) {
  return (
    <div className={clsx('rounded-2xl border border-gray-200 bg-gray-100 shadow-sm', className)}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            {title && <h2 className="font-display text-base font-extrabold text-gray-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={clsx('px-5 pb-5', bodyClassName)}>{children}</div>
    </div>
  );
}
