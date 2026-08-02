import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import AuthShell, { Field, AuthInput, AuthButton, FormAlert } from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

const secondaryButtonClass =
  'flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#E5E7EB] bg-white text-[15px] font-bold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-[#F8F8F8] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('We couldn\'t send a reset link. Check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    setResending(true);
    try {
      await resetPassword(email);
    } catch {
      setError('We couldn\'t send another link. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell mode="reset" noHeader>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-[0_16px_40px_rgba(249,115,22,0.35)]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.3 }}
                >
                  <Check size={32} strokeWidth={3} />
                </motion.div>
              </motion.div>
            </div>

            <h1 className="mt-7 text-center font-display text-3xl font-extrabold tracking-[-0.03em] text-gray-900">
              Email sent
            </h1>
            <p className="mt-3 text-center text-[15px] leading-relaxed text-gray-500">
              We&apos;ve sent a password reset link to <strong className="text-gray-900">{email}</strong>. Please check
              your inbox and spam folder.
            </p>

            <p className="mt-6 text-center text-sm font-medium text-gray-400">Didn&apos;t receive it?</p>

            <div className="mt-3 space-y-3">
              <AuthButton type="button" loading={resending} loadingText="Sending..." onClick={resend}>
                Resend Email
              </AuthButton>
              <Link to="/auth/login" className={secondaryButtonClass}>
                Back to Login
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF4EB] text-[#F97316] shadow-[0_10px_25px_rgba(249,115,22,0.18)]"
              >
                <ShieldCheck size={34} />
              </motion.div>
            </div>

            <h1 className="mt-7 text-center font-display text-3xl font-extrabold tracking-[-0.03em] text-gray-900">
              Reset your password
            </h1>
            <p className="mt-3 text-center text-[15px] leading-relaxed text-gray-500">
              Enter your email address and we&apos;ll send you a secure link to reset your password.
            </p>

            <AnimatePresence>{error && <div className="mt-6"><FormAlert>{error}</FormAlert></div>}</AnimatePresence>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <Field label="Email address" htmlFor="email">
                <AuthInput
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>
              <AuthButton loading={loading} loadingText="Sending...">
                Send reset link
              </AuthButton>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <Link
                to="/auth/login"
                className="inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-gray-600 transition-colors hover:text-[#F97316]"
              >
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
