import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthShell, {
  TextField,
  AuthButton,
  AuthCheckbox,
  SocialDivider,
  SocialButtons,
  FormAlert,
} from '../components/AuthShell';
import { Check, Shield, ArrowRight } from 'lucide-react';

const requirements = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const strengthColor = { Weak: '#DC2626', Medium: '#F97316', Good: '#16A34A', Strong: '#16A34A' };

const PH = { first: 'xxx', last: 'xxx', email: 'you@example.com', phone: '+263 71 234 5678' };

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    const passed = requirements.filter((r) => r.test(password)).length;
    if (password.length === 0) return { label: '', pct: 0 };
    if (passed <= 1) return { label: 'Weak', pct: 25 };
    if (passed <= 2) return { label: 'Medium', pct: 50 };
    if (passed <= 3) return { label: 'Good', pct: 75 };
    return { label: 'Strong', pct: 100 };
  }, [password]);

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email address is invalid.';
    if (phone && !/^\+?[\d\s\-()]{7,}$/.test(phone)) errs.phone = 'Phone number is invalid.';
    if (!password) errs.password = 'Password is required.';
    else if (strength.pct < 50) errs.password = 'Password is too weak.';
    if (password !== confirmPassword) errs.confirm = 'Passwords do not match.';
    if (!agreed) errs.agreed = 'You must agree to the terms.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await register(email, password, `${firstName.trim()} ${lastName.trim()}`);
      navigate('/auth/select-role');
    } catch {
      setError('Failed to create an account. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const color = strengthColor[strength.label];

  return (
    <AuthShell mode="signup">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormAlert>{error}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="firstName"
            label="First name"
            type="text"
            placeholder={PH.first}
            value={firstName}
            invalid={!!errors.firstName}
            error={errors.firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors((p) => ({ ...p, firstName: '' }));
            }}
            autoComplete="given-name"
          />
          <TextField
            id="lastName"
            label="Last name"
            type="text"
            placeholder={PH.last}
            value={lastName}
            invalid={!!errors.lastName}
            error={errors.lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors((p) => ({ ...p, lastName: '' }));
            }}
            autoComplete="family-name"
          />
        </div>

        <TextField
          id="email"
          label="Email address"
          type="email"
          placeholder={PH.email}
          value={email}
          invalid={!!errors.email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((p) => ({ ...p, email: '' }));
          }}
          autoComplete="email"
          inputMode="email"
        />

        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          placeholder={PH.phone}
          value={phone}
          invalid={!!errors.phone}
          error={errors.phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setErrors((p) => ({ ...p, phone: '' }));
          }}
          autoComplete="tel"
          inputMode="tel"
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          placeholder="Create a secure password"
          value={password}
          invalid={!!errors.password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((p) => ({ ...p, password: '' }));
          }}
          autoComplete="new-password"
        />

        {password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-2">
              <Shield size={16} style={{ color }} className={strength.pct >= 75 ? 'fill-current' : ''} />
              <span className="text-xs font-medium" style={{ color }}>
                Password strength: {strength.label}
              </span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: strength.pct >= i * 25 ? color : '#E5E7EB' }}
                />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {requirements.map((req) => {
                const passed = req.test(password);
                return (
                  <div key={req.label} className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-300 ${
                        passed ? 'bg-emerald-600' : 'bg-hc-ink-3/40'
                      }`}
                    >
                      {passed && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={passed ? 'text-emerald-600' : 'text-hc-ink-3'}>{req.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <TextField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          invalid={!!errors.confirm}
          error={errors.confirm}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors((p) => ({ ...p, confirm: '' }));
          }}
          autoComplete="new-password"
        />

        {confirmPassword && password === confirmPassword && (
          <motion.p
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            className="-mt-1 flex items-center gap-1 text-xs text-emerald-600"
          >
            <Check size={11} strokeWidth={3} /> Passwords match
          </motion.p>
        )}

        <div>
          <AuthCheckbox
            checked={agreed}
            onChange={() => {
              setAgreed(!agreed);
              setErrors((p) => ({ ...p, agreed: '' }));
            }}
          >
            I agree to the{' '}
            <a href="/terms" className="font-medium text-hc-ink underline underline-offset-2 transition-colors hover:text-hc-brand">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-hc-ink underline underline-offset-2 transition-colors hover:text-hc-brand">
              Privacy Policy
            </a>
          </AuthCheckbox>
          {errors.agreed && <p className="mt-1 text-xs text-red-600">{errors.agreed}</p>}
        </div>

        <AuthButton loading={loading}>Create account</AuthButton>
      </form>

      <SocialDivider />
      <SocialButtons />

      <div className="mt-6 rounded-2xl border border-hc-hairline bg-hc-page/70 p-4">
        <p className="text-center text-sm text-hc-ink-2">Already have an account?</p>
        <Link
          to="/auth/login"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-hc-brand bg-white px-5 text-[15px] font-medium text-hc-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-hc-brand hover:text-white hover:shadow-md hover:shadow-hc-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-brand/40 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98]"
        >
          Sign in <ArrowRight size={16} />
        </Link>
      </div>
    </AuthShell>
  );
}
