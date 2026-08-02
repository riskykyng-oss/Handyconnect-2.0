const STYLES = {
  open: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  assigned: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  cancelled: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  client: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  handyman: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  admin: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  verified: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
};

export default function StatusBadge({ status, children }) {
  const label = children || status;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STYLES[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
      {label}
    </span>
  );
}
