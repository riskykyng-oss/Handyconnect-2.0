import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import AuthShell, { TextField, AuthButton, FormAlert } from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

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

  const backLink = (
    <Link
      to="/auth/login"
      className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-hc-brand transition-colors hover:text-hc-brand-strong"
    >
      <ArrowLeft size={15} /> Back to sign in
    </Link>
  );

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
            className="text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hc-brand text-white shadow-md shadow-hc-brand/25">
              <Check size={28} strokeWidth={3} />
            </div>

            <h1 className="mt-6 font-display text-[30px] font-medium tracking-tight text-hc-ink">Email sent</h1>
            <p className="mt-2 text-[15px] leading-6 text-hc-ink-2">
              We&apos;ve sent a password reset link to <span className="font-medium text-hc-ink">{email}</span>. Please
              check your inbox and spam folder.
            </p>

            <p className="mt-6 text-sm text-hc-ink-3">Didn&apos;t receive it?</p>

            <div className="mt-3">
              <AuthButton type="button" loading={resending} loadingText="Sending…" onClick={resend}>
                Resend email
              </AuthButton>
              {backLink}
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hc-tint text-hc-brand">
              <ShieldCheck size={30} />
            </div>

            <h1 className="mt-6 text-center font-display text-[30px] font-medium tracking-tight text-hc-ink">
              Reset your password
            </h1>
            <p className="mt-2 text-center text-[15px] leading-6 text-hc-ink-2">
              Enter your email address and we&apos;ll send you a secure link to reset your password.
            </p>

            <AnimatePresence>{error && <div className="mt-5"><FormAlert>{error}</FormAlert></div>}</AnimatePresence>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <TextField
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                required
              />
              <AuthButton loading={loading} loadingText="Sending…">
                Send reset link
              </AuthButton>
              {backLink}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
