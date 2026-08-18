import { useMemo, useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { toast } from 'react-hot-toast';

function makeTxRef() {
  return `HC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function FlutterwaveCheckout({ amount, currency = 'USD', payerEmail, payerName, onSuccess, onError }) {
  const value = Number(amount);

  const [txRef] = useState(makeTxRef);

  const config = useMemo(() => ({
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: txRef,
    amount: value,
    currency,
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: payerEmail || 'client@handyconnect.demo',
      name: payerName || 'Client',
    },
    customizations: {
      title: 'HandyConnect',
      description: 'Payment for HandyConnect service',
      logo: 'https://handyconnect-tawny.vercel.app/favicon.svg',
    },
  }), [txRef, value, currency, payerEmail, payerName]);

  const handleFlutterPayment = useFlutterwave(config);

  if (!value || value <= 0) return null;

  return (
    <button
      onClick={() => {
        handleFlutterPayment({
          ...config,
          onClose: () => {},
          callback: (response) => {
            closePaymentModal();
            if (response.status === 'successful') {
              onSuccess?.(response);
            } else {
              toast.error('Payment was not completed.');
              onError?.(new Error('Payment unsuccessful'));
            }
          },
        });
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#083d2f] hover:shadow-md active:translate-y-0"
    >
      Pay ${value.toFixed(2)} with Flutterwave
    </button>
  );
}
