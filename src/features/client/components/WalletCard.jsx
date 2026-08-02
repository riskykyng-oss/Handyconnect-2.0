import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowDownToLine, Clock, Ticket, Coins, ArrowUpRight, Loader2 } from 'lucide-react';
import useWallet from '@/hooks/useWallet';

function SkeletonBlock() {
  return <div className="animate-pulse rounded-xl bg-gray-200 h-5" />;
}

export default function WalletCard() {
  const navigate = useNavigate();
  const { wallet, loading } = useWallet();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-sm">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">My Wallet</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">Available Balance</p>
          {loading ? (
            <div className="mt-2 space-y-2">
              <SkeletonBlock />
              <div className="w-1/2"><SkeletonBlock /></div>
            </div>
          ) : (
            <p className="font-display mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
              ${wallet.balance?.toFixed(2) || '0.00'}
            </p>
          )}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#E5E7EB] p-2.5 text-center">
            <Clock size={13} className="mx-auto mb-1 text-gray-500" />
            <p className="text-xs font-bold text-gray-900">${wallet.pending || 0}</p>
            <p className="text-[10px] text-gray-500">Pending</p>
          </div>
          <div className="rounded-xl bg-[#E5E7EB] p-2.5 text-center">
            <Ticket size={13} className="mx-auto mb-1 text-gray-500" />
            <p className="text-xs font-bold text-gray-900">{wallet.coupons || 0}</p>
            <p className="text-[10px] text-gray-500">Coupons</p>
          </div>
          <div className="rounded-xl bg-[#E5E7EB] p-2.5 text-center">
            <Coins size={13} className="mx-auto mb-1 text-gray-500" />
            <p className="text-xs font-bold text-gray-900">${wallet.credits || 0}</p>
            <p className="text-[10px] text-gray-500">Credits</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/client/wallet')}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
        >
          <ArrowDownToLine size={16} /> Manage Wallet
        </button>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Quick Actions</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-[#E5E7EB] p-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
                  <ArrowUpRight size={13} className="text-red-500" />
                </div>
                <span className="text-xs font-medium text-gray-700">Pay for a job</span>
              </div>
              <span className="text-xs font-semibold text-gray-500">Pay</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#E5E7EB] p-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                  <ArrowDownToLine size={13} className="text-green-500" />
                </div>
                <span className="text-xs font-medium text-gray-700">Add funds</span>
              </div>
              <span className="text-xs font-semibold text-gray-500">Deposit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
