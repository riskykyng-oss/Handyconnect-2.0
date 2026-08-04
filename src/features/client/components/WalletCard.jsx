import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight } from 'lucide-react';
import useWallet from '@/hooks/useWallet';
import { cardClass } from './dashboardUtils';

export default function WalletCard() {
  const navigate = useNavigate();
  const { wallet, loading } = useWallet();

  const balance = wallet.balance || 0;

  return (
    <div className={cardClass}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-hc-brand ring-1 ring-inset ring-hc-brand/15">
              <Wallet size={16} />
            </span>
            <span className="text-sm font-medium text-hc-ink">My Wallet</span>
          </span>
          <button
            onClick={() => navigate('/client/wallet')}
            className="flex items-center gap-1 text-sm font-medium text-hc-brand transition-colors hover:text-hc-brand-strong"
          >
            Manage <ArrowUpRight size={14} />
          </button>
        </div>

        <p className="mt-4 text-[13px] text-hc-caption">Available balance</p>
        {loading ? (
          <div className="mt-1.5 h-9 w-32 animate-pulse rounded-lg bg-hc-tile" />
        ) : (
          <p className="mt-1 text-[30px] font-semibold leading-none tracking-tight text-hc-ink">
            ${balance.toFixed(2)}
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Pending', value: wallet.pending || 0, prefix: '$' },
            { label: 'Coupons', value: wallet.coupons || 0, prefix: '' },
            { label: 'Credits', value: wallet.credits || 0, prefix: '$' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-hc-page px-2 py-2.5 text-center">
              <p className="text-sm font-semibold text-hc-ink">{item.prefix}{item.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-hc-caption">{item.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-center text-xs font-medium text-hc-ink-2">
          {balance > 0 ? 'Funds are ready for your next job.' : 'Add funds to get started'}
        </p>
      </div>
    </div>
  );
}
