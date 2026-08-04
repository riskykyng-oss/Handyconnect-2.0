import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div whileHover={hover ? { y: -2 } : undefined} className={clsx('rounded-xl border border-black/[0.07] bg-white p-6 shadow-sm transition-shadow', hover && 'hover:shadow-md', className)} {...props}>
      {children}
    </motion.div>
  );
}
