import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ReceiptText, Download, Share2, Check } from 'lucide-react';
import { WalletModal } from '@/features/wallet/components/WalletModal';

const normalizeDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value || 0));

export default function ReceiptModal({ tx, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!tx) return null;

  const credit = tx.kind === 'credit';
  const date = normalizeDate(tx.createdAt);

  const receiptText = [
    'HANDYCONNECT RECEIPT',
    '----------------------',
    `Date:     ${format(date, 'MMM d, yyyy h:mm a')}`,
    `Type:     ${(tx.description || 'Transaction').toUpperCase()}`,
    `Amount:   ${credit ? '+' : '-'}$${Number(tx.amount || 0).toFixed(2)} USD`,
    `Status:   Completed`,
    `Ref:      ${tx.id}`,
    '',
    'Thanks for using HandyConnect!',
  ].join('\n');

  const download = () => {
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handyconnect-receipt-${tx.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'HandyConnect receipt', text: receiptText });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <WalletModal
      open={!!tx}
      onClose={onClose}
      icon={<ReceiptText size={18} />}
      title="Receipt"
      subtitle={tx.id?.slice(0, 10)}
    >
      <div className="p-5">
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800/60">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</p>
          <p className={`mt-1 font-display text-4xl font-semibold ${credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-hc-ink dark:text-white'}`}>
            {credit ? '+' : '-'}${Number(tx.amount || 0).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-400">USD</p>
        </div>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-400">Description</dt>
            <dd className="truncate text-right font-semibold text-hc-ink dark:text-white">{tx.description || '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-400">Date</dt>
            <dd className="font-semibold text-hc-ink dark:text-white">{format(date, 'MMM d, yyyy · h:mm a')}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-400">Status</dt>
            <dd className="font-semibold text-emerald-600">Completed</dd>
          </div>
          {tx.category && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-400">Category</dt>
              <dd className="font-semibold text-hc-ink dark:text-white">{tx.category}</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={download}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <Download size={14} /> PDF
          </button>
          <button
            onClick={share}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-hc-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>
    </WalletModal>
  );
}
