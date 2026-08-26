import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={title}>
    <motion.button className="absolute inset-0 bg-hc-ink/50" aria-label="Close modal" onClick={onClose} />
    <motion.div className={`relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-hc-hairline bg-hc-surface p-6 shadow-2xl ${className}`} initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}>
      {(title || onClose) && <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-lg font-semibold tracking-tight text-hc-ink">{title}</h2>{onClose && <button onClick={onClose} className="rounded-lg p-2 text-hc-ink-3 hover:bg-hc-brand-50" aria-label="Close modal"><X size={18} /></button>}</div>}
      {children}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
