import clsx from 'clsx';
import { X } from 'lucide-react';

export function WalletModal({ open, onClose, icon, title, subtitle, children, maxWidth = 'max-w-md' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={clsx('flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-xl border border-black/[0.07] bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900', maxWidth)} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-gray-200/70 px-5 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-hc-ink dark:text-white">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-hc-caption dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function MethodSelect({ methods, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {methods.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={clsx(
              'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors',
              value === m.id
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            )}
          >
            {Icon && <Icon size={15} />}
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
