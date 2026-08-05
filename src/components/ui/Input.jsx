import clsx from 'clsx';

export default function Input({
  label,
  type="text",
  id,
  error,
  hint,
  className,
  ...props
}) {
  const inputId = id || props.name;
  return <div className="space-y-1.5">
    {label && <label htmlFor={inputId} className="block text-sm font-medium text-hc-ink-2 dark:text-gray-300">{label}</label>}
    <input id={inputId} type={type} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined}
      className={clsx('min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-hc-ink placeholder:text-hc-ink-3 transition-colors focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/20 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400', error ? 'border-red-500' : 'border-black/[0.12] dark:border-gray-600', className)} {...props} />
    {error ? <p id={`${inputId}-error`} className="text-sm text-red-600">{error}</p> : hint && <p className="text-sm text-hc-ink-3">{hint}</p>}
  </div>;
}
