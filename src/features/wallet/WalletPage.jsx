import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Wallet, Loader2, TrendingUp } from 'lucide-react';

export default function WalletPage() {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      if (currentUser) {
        const walletRef = doc(db, 'wallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);
        
        if (walletSnap.exists()) {
          setBalance(walletSnap.data().balance || 0);
        } else {
          // Create wallet if it doesn't exist yet
          await setDoc(walletRef, { balance: 0, currency: 'USD' });
          setBalance(0);
        }
        setLoading(false);
      }
    };
    fetchWallet();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-500 mt-2">Track your earnings from completed jobs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-[#111827] to-gray-800 text-white border-0 md:col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Wallet size={16} /> Available Balance
              </p>
              <h2 className="text-4xl font-bold">${balance.toFixed(2)}</h2>
            </div>
            <TrendingUp className="text-green-400" size={48} />
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold text-gray-900">$0.00</h3>
          <p className="text-gray-500 text-sm">Pending Clearance</p>
        </Card>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h3>
      <Card>
        <p className="text-gray-500 text-center py-8">Transaction history will appear here once you complete jobs!</p>
      </Card>
    </div>
  );
}