import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, Smartphone, Phone, AlertTriangle, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STEP = {
  phone: 'phone',
  ussd: 'ussd',
  otp: 'otp',
  processing: 'processing',
  success: 'success',
  failed: 'failed',
  timeout: 'timeout',
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const generateRef = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `HC-${date}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

function isValidZimPhone(digits) {
  if (digits.length < 9) return false;
  const prefix = Number(digits.slice(0, 3));
  return prefix >= 71 && prefix <= 79;
}

export default function EcoCashCheckout({ amount, recipientName, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(STEP.phone);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [reference, setReference] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [checklist, setChecklist] = useState([false, false, false, false]);
  const timeoutRef = useRef(null);

  const value = Number(amount) || 0;

  const fullPhone = `+263 ${phone}`.trim();

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
    setStep(STEP.phone);
    setPhone('');
    setPhoneError('');
    setOtp('');
    setGeneratedOtp('');
    setReference('');
    setAttempts(0);
    setChecklist([false, false, false, false]);
  }, []);

  const handlePhoneSubmit = () => {
    const digits = phone.replace(/\D/g, '');
    if (!isValidZimPhone(digits)) {
      setPhoneError('Please enter a valid Zimbabwean mobile number (71-79).');
      return;
    }
    setPhoneError('');
    setStep(STEP.ussd);
  };

  const handleUssdConfirm = () => {
    const code = generateOtp();
    setGeneratedOtp(code);
    setReference(generateRef());
    setStep(STEP.otp);
    toast(
      () => (
        <div className="text-sm">
          <p className="font-semibold">Demo OTP: <span className="font-mono text-base">{code}</span></p>
          <p className="mt-1 text-gray-500 text-xs">For demonstration purposes only.</p>
        </div>
      ),
      { icon: '📱', duration: 15000 }
    );
  };

  const handleOtpVerify = () => {
    if (otp.trim() !== generatedOtp) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 3) {
        setStep(STEP.failed);
        return;
      }
      toast.error(`Invalid OTP. ${3 - next} attempt${3 - next === 1 ? '' : 's'} remaining.`);
      setOtp('');
      return;
    }
    setStep(STEP.processing);
    const steps = [
      { idx: 0, delay: 600 },
      { idx: 1, delay: 1400 },
      { idx: 2, delay: 2400 },
      { idx: 3, delay: 3200 },
    ];
    steps.forEach(({ idx, delay }) => {
      setTimeout(() => setChecklist((prev) => { const n = [...prev]; n[idx] = true; return n; }), delay);
    });
    timeoutRef.current = setTimeout(() => setStep(STEP.success), 4000);
  };

  const handleRetry = () => {
    setStep(STEP.phone);
    setOtp('');
    setAttempts(0);
    setChecklist([false, false, false, false]);
  };

  const handleDone = () => {
    reset();
    onSuccess?.();
  };

  if (value <= 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#083d2f] hover:shadow-md active:translate-y-0"
      >
        <Smartphone size={16} />
        Simulate EcoCash Payment · ${value.toFixed(2)}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={![STEP.processing, STEP.success].includes(step) ? reset : undefined}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
            {![STEP.processing, STEP.success].includes(step) && (
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
                  <p className="text-sm font-bold text-gray-900">Simulated EcoCash Gateway</p>
                  <p className="text-[11px] text-gray-400">Academic demonstration — no real transaction</p>
                </div>
              </div>

              {/* Amount */}
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Amount</p>
                <p className="mt-0.5 font-display text-2xl font-bold text-gray-900">${value.toFixed(2)}</p>
                <p className="text-xs text-gray-500">to {recipientName || 'Professional'}</p>
              </div>

              {/* Body */}
              <div className="px-5 py-5">

                {/* STEP: Phone */}
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
                        onChange={(e) => { setPhone(formatPhone(e.target.value)); setPhoneError(''); }}
                        placeholder="7X XXX XXXX"
                        autoFocus
                        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                        <AlertTriangle size={12} /> {phoneError}
                      </p>
                    )}
                    <button
                      onClick={handlePhoneSubmit}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#083d2f]"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* STEP: USSD */}
                {step === STEP.ussd && (
                  <div>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                      <p className="text-sm font-bold text-amber-800">USSD Authorisation Required</p>
                      <p className="mt-2 text-sm text-amber-700">
                        Dial <span className="font-mono font-bold">*151*1*2#</span> on your phone to authorise this payment.
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-amber-500">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                        Waiting for USSD confirmation...
                      </div>
                    </div>
                    <button
                      onClick={handleUssdConfirm}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0a4d3c] bg-[#0a4d3c]/5 px-4 py-3 text-sm font-bold text-[#0a4d3c] transition-colors hover:bg-[#0a4d3c]/10"
                    >
                      Simulate USSD Confirmation
                    </button>
                    <p className="mt-2 text-center text-[11px] text-gray-400">
                      Demo: Click to simulate a successful USSD authorisation.
                    </p>
                  </div>
                )}

                {/* STEP: OTP */}
                {step === STEP.otp && (
                  <div>
                    <p className="mb-3 text-sm text-gray-600">
                      Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{fullPhone}</span>
                    </p>
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center mb-4">
                      <p className="text-xs text-blue-600">
                        <span className="font-bold">Demo OTP:</span>{' '}
                        <span className="font-mono text-base font-bold text-blue-800">{generatedOtp}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-blue-400">Displayed for demonstration purposes</p>
                    </div>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      maxLength={6}
                      autoFocus
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-gray-900 outline-none transition-all focus:border-[#0a4d3c] focus:bg-white focus:ring-2 focus:ring-[#0a4d3c]/10"
                    />
                    <button
                      onClick={handleOtpVerify}
                      disabled={otp.length < 6}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#083d2f] disabled:opacity-50"
                    >
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

                {/* STEP: Processing */}
                {step === STEP.processing && (
                  <div className="py-4">
                    <p className="mb-4 text-center text-sm font-semibold text-gray-900">Processing payment...</p>
                    <div className="space-y-3">
                      {[
                        'Payment request received',
                        'USSD authorisation verified',
                        'OTP verification completed',
                        'Updating wallet balance',
                      ].map((label, i) => (
                        <div key={label} className="flex items-center gap-3">
                          {checklist[i] ? (
                            <CheckCircle2 size={18} className="shrink-0 text-[#0a4d3c]" />
                          ) : (
                            <Circle size={18} className="shrink-0 text-gray-300" />
                          )}
                          <span className={`text-sm ${checklist[i] ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mx-auto mt-5 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0a4d3c]" />
                      Processing...
                    </div>
                  </div>
                )}

                {/* STEP: Success */}
                {step === STEP.success && (
                  <div className="py-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 size={52} className="mx-auto text-[#0a4d3c]" />
                    </motion.div>
                    <p className="mt-4 font-display text-lg font-bold text-gray-900">Payment Successful</p>
                    <p className="mt-1 text-sm text-gray-500">
                      ${value.toFixed(2)} added to HandyConnect wallet
                    </p>
                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      Reference: <span className="font-mono font-semibold text-gray-700">{reference}</span>
                    </div>
                    <p className="mt-3 text-[11px] text-gray-400">
                      Wallet balance updated via server-side Firestore transaction.
                    </p>
                    <button
                      onClick={handleDone}
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#083d2f]"
                    >
                      Done
                    </button>
                  </div>
                )}

                {/* STEP: Failed */}
                {step === STEP.failed && (
                  <div className="py-4 text-center">
                    <AlertTriangle size={44} className="mx-auto text-red-500" />
                    <p className="mt-4 font-display text-lg font-bold text-gray-900">Payment Failed</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum OTP attempts exceeded. Payment was not processed.
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Wallet balance unchanged.</p>
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={reset}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRetry}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0a4d3c] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#083d2f]"
                      >
                        <RotateCcw size={14} /> Retry
                      </button>
                    </div>
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
