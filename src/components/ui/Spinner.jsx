export default function Spinner({ size = 'md', label = 'Loading' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };
  return <span role="status" aria-label={label} className={`inline-block animate-spin rounded-full border-2 border-orange-200 border-t-orange-500 ${sizes[size]}`}><span className="sr-only">{label}</span></span>;
}
