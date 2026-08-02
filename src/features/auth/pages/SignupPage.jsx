import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthShell, {
  Field,
  AuthInput,
  AuthButton,
  AuthCheckbox,
  SocialDivider,
  SocialButtons,
  FormAlert,
} from '../components/AuthShell';
import { Eye, EyeOff, Check, Shield } from 'lucide-react';

const requirements = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const strengthColor = { Weak: '#DC2626', Medium: '#F97316', Good: '#16A34A', Strong: '#16A34A' };

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
          <Field label="First Name" htmlFor="firstName">
            <AuthInput
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              invalid={!!errors.firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrors((p) => ({ ...p, firstName: '' }));
              }}
              autoComplete="given-name"
            />
            {errors.firstName && <p className="mt-1.5 text-xs text-red-600">{errors.firstName}</p>}
          </Field>
          <Field label="Last Name" htmlFor="lastName">
            <AuthInput
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              invalid={!!errors.lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setErrors((p) => ({ ...p, lastName: '' }));
              }}
              autoComplete="family-name"
            />
            {errors.lastName && <p className="mt-1.5 text-xs text-red-600">{errors.lastName}</p>}
          </Field>
        </div>

        <Field label="Email Address" htmlFor="email">
          <AuthInput
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            invalid={!!errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: '' }));
            }}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
        </Field>

        <Field label="Phone Number" htmlFor="phone">
          <AuthInput
            id="phone"
            type="tel"
            placeholder="+263 71 234 5678"
            value={phone}
            invalid={!!errors.phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors((p) => ({ ...p, phone: '' }));
            }}
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
        </Field>

        <Field label="Password" htmlFor="password">
          <AuthInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a secure password"
            value={password}
            invalid={!!errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: '' }));
            }}
            autoComplete="new-password"
            right={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
                className="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:text-gray-900"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}

          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center gap-2">
                <Shield size={16} style={{ color }} className={strength.pct >= 75 ? 'fill-current' : ''} />
                <span className="text-xs font-bold" style={{ color }}>
                  Password Strength: {strength.label}
                </span>
              </div>
              <div className="mt-2 flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
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
                        className={`flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300 ${
                          passed ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        {passed && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={passed ? 'text-green-600' : 'text-gray-500'}>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </Field>

        <Field label="Confirm Password" htmlFor="confirmPassword">
          <AuthInput
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={confirmPassword}
            invalid={!!errors.confirm}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((p) => ({ ...p, confirm: '' }));
            }}
            autoComplete="new-password"
            right={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
                className="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:text-gray-900"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          {errors.confirm && <p className="mt-1.5 text-xs text-red-600">{errors.confirm}</p>}
          {confirmPassword && password === confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 flex items-center gap-1 text-xs text-green-600"
            >
              <Check size={11} strokeWidth={3} /> Passwords match
            </motion.p>
          )}
        </Field>

        <div>
          <AuthCheckbox
            checked={agreed}
            onChange={() => {
              setAgreed(!agreed);
              setErrors((p) => ({ ...p, agreed: '' }));
            }}
          >
            I agree to the{' '}
            <a href="/terms" className="font-semibold text-gray-900 underline underline-offset-2 transition-colors hover:text-[#F97316]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-semibold text-gray-900 underline underline-offset-2 transition-colors hover:text-[#F97316]">
              Privacy Policy
            </a>
          </AuthCheckbox>
          {errors.agreed && <p className="mt-1 text-xs text-red-600">{errors.agreed}</p>}
        </div>

        <AuthButton loading={loading}>Create Account</AuthButton>
      </form>

      <SocialDivider />
      <SocialButtons />

      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-bold text-[#F97316] transition-colors hover:text-[#EA580C]">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
