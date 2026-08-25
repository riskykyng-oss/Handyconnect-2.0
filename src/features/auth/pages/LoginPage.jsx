import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserDocument } from '@/firebase/firestore';
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
      const user = await login(email, password);
      const doc = await getUserDocument(user.uid);
      const role = doc?.role;
      if (role === 'client') navigate('/client/home', { replace: true });
      else if (role === 'handyman') navigate('/handyman/dashboard', { replace: true });
      else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/auth/select-role', { replace: true });
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

      <div className="mt-6 rounded-2xl border border-hc-hairline bg-hc-page/70 p-4">
        <p className="text-center text-sm text-hc-ink-2">New to HandyConnect?</p>
        <Link
          to="/auth/signup"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-hc-brand bg-white px-5 text-[15px] font-medium text-hc-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-hc-brand hover:text-white hover:shadow-md hover:shadow-hc-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-brand/40 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98]"
        >
          Create account <ArrowRight size={16} />
        </Link>
      </div>
    </AuthShell>
  );
}
