import { useMemo } from 'react';
import { isToday, isYesterday, format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, ChevronRight, ReceiptText } from 'lucide-react';

const normalizeDate = (value) => {
  if (value?.toDate) return value.toDate();
  return value instanceof Date ? value : new Date(value || 0);
};

const groupByDay = (transactions) => {
  const map = new Map();
  [...transactions]
    .sort((a, b) => normalizeDate(b.createdAt).getTime() - normalizeDate(a.createdAt).getTime())
    .forEach((tx) => {
      const d = normalizeDate(tx.createdAt);
      const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'EEEE, MMM d');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(tx);
    });
  return [...map.entries()];
};

export default function TransactionList({ transactions, onOpen, emptyText = 'No transactions yet', limit: max }) {
  const groups = useMemo(() => groupByDay(transactions), [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200/70 text-gray-400">
          <ReceiptText size={22} />
        </span>
        <p className="text-sm font-semibold text-hc-caption">{emptyText}</p>
      </div>
    );
  }

  const visible = max ? groups.slice(0, max) : groups;

  return (
    <div className="space-y-4">
      {visible.map(([day, txs]) => (
        <div key={day}>
          <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{day}</p>
          <div className="divide-y divide-gray-200/60 rounded-xl border border-black/[0.07] bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900">
            {txs.map((tx) => {
              const credit = tx.kind === 'credit';
              return (
                <button
                  key={tx.id}
                  onClick={() => onOpen?.(tx)}
                  className="flex min-w-0 w-full items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${credit ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {credit ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">{tx.description || 'Wallet transaction'}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{format(normalizeDate(tx.createdAt), 'MMM d · h:mm a')}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`font-display text-sm font-semibold ${credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-hc-ink dark:text-white'}`}>
                      {credit ? '+' : '-'}${Number(tx.amount || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400">{credit ? 'Received' : 'Sent'}</p>
                  </div>
                  {onOpen && <ChevronRight size={14} className="shrink-0 text-gray-300" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
