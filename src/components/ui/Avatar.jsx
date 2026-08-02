import clsx from 'clsx';
const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
export default function Avatar({ src, alt = '', name = '', size = 'md', className }) {
  const initials = name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <span className={clsx('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300', sizes[size], className)} aria-label={alt || name}>
    {src ? <img className="h-full w-full object-cover" src={src} alt={alt} /> : initials || '?'}
  </span>;
}
