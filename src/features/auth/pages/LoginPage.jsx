import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell, {
  TextField,
  AuthButton,
  AuthCheckbox,
  SocialDivider,
  SocialButtons,
  FormAlert,
} from '../components/AuthShell';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormAlert>{error}</FormAlert>}

        <TextField
          id="email"
          label="Email address"
          type="email"
          placeholder="john@example.com"
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
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          invalid={!!errors.password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((p) => ({ ...p, password: '' }));
          }}
          autoComplete="current-password"
          rightLink={
            <Link
              to="/auth/forgot-password"
              className="text-[13px] font-medium text-hc-brand transition-colors hover:text-hc-brand-strong"
            >
              Forgot password?
            </Link>
          }
        />

        <AuthCheckbox checked={remember} onChange={() => setRemember(!remember)}>
          Remember me
        </AuthCheckbox>

        <AuthButton loading={loading}>Sign in</AuthButton>
      </form>

      <SocialDivider />
      <SocialButtons />

      <p className="mt-6 text-center text-sm text-hc-ink-2">
        Don&apos;t have an account?{' '}
        <Link to="/auth/signup" className="font-medium text-hc-brand transition-colors hover:text-hc-brand-strong">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
