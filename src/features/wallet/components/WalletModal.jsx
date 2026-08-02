import clsx from 'clsx';
import { X } from 'lucide-react';

export function WalletModal({ open, onClose, icon, title, subtitle, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={clsx('flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl', maxWidth)} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              {icon}
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-gray-900">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
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
                ? 'border-orange-400 bg-orange-50 text-orange-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
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
