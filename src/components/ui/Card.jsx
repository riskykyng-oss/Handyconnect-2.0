import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div whileHover={hover ? { y: -2 } : undefined} className={clsx('rounded-xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)] transition-shadow', hover && 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.06)]', className)} {...props}>
      {children}
    </motion.div>
  );
}
