import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email address is invalid.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password is too short.';
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
      await login(email, password);
      navigate('/auth/select-role');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="login">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <FormAlert>{error}</FormAlert>}

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

        <Field
          label="Password"
          htmlFor="password"
          right={
            <Link
              to="/auth/forgot-password"
              className="rounded-full bg-[#F97316] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#EA580C] hover:shadow-md"
            >
              Forgot password?
            </Link>
          }
        >
          <AuthInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            invalid={!!errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: '' }));
            }}
            autoComplete="current-password"
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
        </Field>

        <AuthCheckbox checked={remember} onChange={() => setRemember(!remember)}>
          Remember me
        </AuthCheckbox>

        <AuthButton loading={loading}>Sign In</AuthButton>
      </form>

      <SocialDivider />
      <SocialButtons />

      <p className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/auth/signup" className="font-bold text-[#F97316] transition-colors hover:text-[#EA580C]">
          Create Account
        </Link>
      </p>
    </AuthShell>
  );
}
