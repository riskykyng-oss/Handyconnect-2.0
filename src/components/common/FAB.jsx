import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export default function FAB({ onClick, icon: Icon = Plus, label = 'Quick action', className = '' }) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.9, rotate: 10 }}
      onClick={onClick}
      aria-label={label}
      className={`lg:hidden fixed bottom-24 right-6 w-16 h-16 bg-[#F97316] rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center z-40 hover:bg-orange-600 transition-colors ${className}`}
    >
      <Icon size={32} className="text-white" />
    </motion.button>
  );
}
