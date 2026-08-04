import clsx from 'clsx';

const SETS = [
  { bg: 'bg-avatar-teal-bg', text: 'text-avatar-teal-text' },
  { bg: 'bg-avatar-blue-bg', text: 'text-avatar-blue-text' },
  { bg: 'bg-avatar-purple-bg', text: 'text-avatar-purple-text' },
  { bg: 'bg-avatar-amber-bg', text: 'text-avatar-amber-text' },
];

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };

const hashKey = (value = '') => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
};

export default function ColoredAvatar({ id = '', name = '', size = 'md', className }) {
  const initials = (name || '?')
    .split(/\s+/)
    .map((part) => part?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const set = SETS[hashKey(id || name) % SETS.length];
  return (
    <span className={clsx('inline-flex shrink-0 items-center justify-center rounded-full font-bold', set.bg, set.text, SIZES[size], className)} aria-label={name}>
      {initials || '?'}
    </span>
  );
}
