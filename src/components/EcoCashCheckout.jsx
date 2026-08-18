import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, Smartphone, ShieldCheck, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STEP = { phone: 'phone', otp: 'otp', processing: 'processing', success: 'success' };

const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000));

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export default function EcoCashCheckout({ amount, recipientName, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(STEP.phone);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const value = Number(amount) || 0;
  if (value <= 0) return null;

  const handleSendOtp = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      toast.error('Enter a valid EcoCash number');
      return;
    }
    const code = generateOtp();
    setGeneratedOtp(code);
    setStep(STEP.otp);
    setTimeout(() => toast(`Your OTP is: ${code}`, { icon: '📱', duration: 10000 }), 300);
  };

  const handleVerifyOtp = () => {
    if (otp.trim() !== generatedOtp) {
      toast.error('Invalid OTP. Check the code sent to your phone.');
      return;
    }
    setStep(STEP.processing);
    setTimeout(() => setStep(STEP.success), 3000);
  };

  const handleDone = () => {
    reset();
    onSuccess?.();
  };

  const reset = () => {
    setOpen(false);
    setStep(STEP.phone);
    setPhone('');
    setOtp('');
    setGeneratedOtp('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#083d2f] hover:shadow-md active:translate-y-0"
      >
        <Smartphone size={16} />
        Pay ${value.toFixed(2)} with EcoCash
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={step !== STEP.processing ? reset : undefined}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {step !== STEP.processing && step !== STEP.success && (
                <button
                  onClick={reset}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a4d3c]">
                  <Smartphone size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">EcoCash Payment</p>
                  <p className="text-xs text-gray-500">Powered by EcoCash · Demo Mode</p>
                </div>
              </div>

              {/* Amount */}
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Amount</p>
                <p className="mt-0.5 font-display text-2xl font-bold text-gray-900">${value.toFixed(2)}</p>
                <p className="text-xs text-gray-500">to {recipientName || 'Professional'}</p>
              </div>

              {/* Steps */}
              <div className="px-5 py-5">
                {step === STEP.phone && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
                      EcoCash Phone Number
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-all focus-within:border-[#0a4d3c] focus-within:ring-2 focus-within:ring-[#0a4d3c]/10">
                      <Phone size={16} className="shrink-0 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-500">+263</span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="7X XXX XXXX"
                        autoFocus
                        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      onClick={handleSendOtp}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#083d2f]"
                    >
                      Send OTP
                    </button>
                    <p className="mt-3 text-center text-[11px] text-gray-400">
                      A 4-digit code will be sent to this number (demo: shown in toast).
                    </p>
                  </div>
                )}

                {step === STEP.otp && (
                  <div>
                    <p className="mb-3 text-sm text-gray-600">
                      Enter the 4-digit OTP sent to <span className="font-semibold text-gray-900">+263 {phone}</span>
                    </p>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="••••"
                      maxLength={4}
                      autoFocus
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-gray-900 outline-none transition-all focus:border-[#0a4d3c] focus:bg-white focus:ring-2 focus:ring-[#0a4d3c]/10"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otp.length < 4}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#083d2f] disabled:opacity-50"
                    >
                      <ShieldCheck size={15} />
                      Verify & Pay
                    </button>
                    <button
                      onClick={() => { setStep(STEP.phone); setOtp(''); }}
                      className="mt-2 w-full rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100"
                    >
                      Change number
                    </button>
                  </div>
                )}

                {step === STEP.processing && (
                  <div className="py-6 text-center">
                    <Loader2 size={40} className="mx-auto mb-4 animate-spin text-[#0a4d3c]" />
                    <p className="font-semibold text-gray-900">Processing payment...</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Dial <span className="font-mono font-bold text-gray-700">*151*1*2#</span> on your phone to approve.
                    </p>
                    <div className="mx-auto mt-4 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0a4d3c]" />
                      Waiting for confirmation
                    </div>
                  </div>
                )}

                {step === STEP.success && (
                  <div className="py-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 size={52} className="mx-auto text-[#0a4d3c]" />
                    </motion.div>
                    <p className="mt-4 font-display text-lg font-bold text-gray-900">Payment Successful</p>
                    <p className="mt-1 text-sm text-gray-500">
                      ${value.toFixed(2)} paid to {recipientName || 'Professional'}
                    </p>
                    <button
                      onClick={handleDone}
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#083d2f]"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
