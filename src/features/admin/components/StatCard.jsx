import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, accent = 'bg-orange-100 text-orange-600', trend, trendLabel }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={22} />
        </div>
        {trend != null && trend !== 0 && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${trend > 0 ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {trendLabel && <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{trendLabel}</p>}
    </div>
  );
}
