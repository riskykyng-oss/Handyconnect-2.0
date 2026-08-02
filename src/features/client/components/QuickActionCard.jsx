import { motion } from 'framer-motion';
import { accentMap } from '@/constants/quickActions';

export default function QuickActionCard({ action, index, onClick }) {
  const Icon = action.icon;
  const isPrimary = action.id === 'post-job';
  const accent = accentMap[action.color];
  const hasBadge = action.badge != null;

  if (isPrimary) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
        whileHover={{ y: -4, scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={onClick}
        aria-label={action.label}
        className="group relative flex h-28 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-orange-400 bg-orange-500 shadow-[0_8px_25px_rgba(249,115,22,.25)] transition-shadow duration-200 hover:shadow-[0_18px_40px_rgba(249,115,22,.35)] focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer"
      >
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 group-hover:scale-110">
          <Icon size={22} className="text-orange-500" />
        </div>
        <span className="text-sm font-extrabold text-white">{action.label}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-label={action.label}
      className={`group relative flex h-24 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-[#E5E7EB] shadow-[0_8px_20px_rgba(0,0,0,.06)] transition-shadow duration-200 hover:shadow-[0_18px_35px_rgba(0,0,0,.12)] focus:outline-none focus:ring-2 ${accent.ring} cursor-pointer`}
    >
      {hasBadge && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
          {action.badge}
        </span>
      )}

      <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-full ${accent.bg} shadow-sm transition-transform duration-200 group-hover:scale-110`}>
        <Icon size={22} className={accent.text} />
      </div>

      <span className="text-sm font-semibold text-[#111827]">{action.label}</span>
    </motion.button>
  );
}
