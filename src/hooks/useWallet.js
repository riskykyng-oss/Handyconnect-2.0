import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeToWallet } from '@/services/walletService';

export default function useWallet() {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToWallet(currentUser.uid, (data) => {
      setWallet(data);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  return { wallet, loading };
}
