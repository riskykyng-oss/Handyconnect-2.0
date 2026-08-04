import { motion, useReducedMotion } from 'framer-motion';

export default function QuickActionTile({ action, index, onPress }) {
  const reduce = useReducedMotion();
  const Icon = action.icon;

  return (
    <motion.button
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onPress}
      aria-label={action.label}
      className="relative flex w-[124px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-black/[0.07] bg-white p-3 shadow-sm transition-colors hover:border-hc-brand hover:bg-hc-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-hc-brand/40"
    >
      {action.badge != null && (
        <span className="absolute right-2 top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hc-brand px-1 text-[9px] font-bold text-white">
          {action.badge}
        </span>
      )}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-hc-brand ring-1 ring-inset ring-hc-brand/15">
        <Icon size={22} strokeWidth={2} />
      </div>
      <span className="text-[13px] font-medium text-hc-ink">{action.label}</span>
    </motion.button>
  );
}
