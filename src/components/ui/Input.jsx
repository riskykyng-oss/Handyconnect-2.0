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
    {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>}
    <input id={inputId} type={type} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined}
      className={clsx('min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20', error ? 'border-red-500' : 'border-gray-300', className)} {...props} />
    {error ? <p id={`${inputId}-error`} className="text-sm text-red-600">{error}</p> : hint && <p className="text-sm text-gray-500">{hint}</p>}
  </div>;
}
