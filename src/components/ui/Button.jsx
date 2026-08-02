import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = 'md',
  loading = false,
  fullWidth = true,
  className = "",
  disabled,
  ...props
}) {
  const styles = {
    primary: 'bg-orange-500 text-white shadow-sm hover:bg-orange-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    outline: 'border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-50',
    danger: 'bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700',
  };
  const sizes = { sm: 'min-h-9 px-3 py-2 text-sm', md: 'min-h-11 px-4 py-2.5 text-sm', lg: 'min-h-12 px-5 py-3 text-base' };

  return (
    <motion.button
      type={type}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      className={clsx('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50', fullWidth && 'w-full', sizes[size], styles[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </motion.button>
  );
}
