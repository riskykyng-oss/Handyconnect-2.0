import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Wrench, ArrowRight, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  {
    id: 'client',
    name: 'Client',
    tagline: 'I want to hire professionals',
    Icon: Home,
    accent: 'bg-[#F97316]',
    iconBg: 'bg-orange-50 text-[#F97316]',
    features: ['Hire professionals', 'Post jobs & get quotes', 'Track progress in real time', 'Pay securely & manage invoices'],
  },
  {
    id: 'handyman',
    name: 'Professional',
    tagline: 'I want to offer my services',
    Icon: Wrench,
    accent: 'bg-gray-900',
    iconBg: 'bg-gray-100 text-gray-700',
    features: ['Find nearby work', 'Build your portfolio', 'Get paid instantly', 'Grow your client base'],
  },
];

const loadingMessages = ['Creating your account...', 'Preparing your workspace...', 'Almost ready...'];

export default function RoleSelectionPage() {
  const { assignRole, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (userRole === 'client') navigate('/client/home', { replace: true });
    if (userRole === 'handyman') navigate('/handyman/dashboard', { replace: true });
    if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
  }, [userRole, navigate]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, loadingMessages.length - 1));
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      await assignRole(role);
      if (role === 'client') navigate('/client/home');
      if (role === 'handyman') navigate('/handyman/dashboard');
    } catch {
      setLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F6F8] px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="my-auto w-full max-w-5xl"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-hc-brand text-sm font-extrabold text-white shadow-md">HC</span>
          <span className="font-display text-xl font-extrabold tracking-tight text-gray-900">
            Handy<span className="text-hc-brand">Connect</span>
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-hc-ink sm:text-4xl">
            Choose how you&apos;ll use HandyConnect
          </h1>
          <p className="mt-2 text-[15px] text-hc-ink-2">Don&apos;t worry — you can update your profile details later.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {roles.map((role, idx) => {
            const isSelected = selectedRole === role.id && loading;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
              >
                <button
                  onClick={() => handleSelectRole(role.id)}
                  disabled={loading}
                  className={`group relative flex h-full w-full flex-col rounded-[28px] border-2 bg-white p-6 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-[#F97316] shadow-[0_20px_50px_rgba(249,115,22,0.15)]'
                      : 'border-transparent shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:border-[#F97316]/60 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]'
                  } disabled:cursor-not-allowed`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                      className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white shadow-md"
                    >
                      <Check size={16} strokeWidth={3} />
                    </motion.div>
                  )}

                  <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${role.iconBg}`}>
                    <role.Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-hc-ink">{role.name}</h3>
                  <p className="mt-1 text-sm text-hc-ink-2">{role.tagline}</p>

                  <div className="mt-5 space-y-2.5">
                    {role.features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5 text-sm text-hc-ink-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-hc-ink-3" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-6 flex items-center justify-center gap-2 rounded-[16px] py-3 text-sm font-bold text-white transition-all duration-200 ${role.accent} ${
                      isSelected ? 'opacity-80' : 'group-hover:brightness-110'
                    }`}
                  >
                    {isSelected ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Continue as {role.name} <ArrowRight size={18} />
                      </>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center gap-3 rounded-[16px] bg-white px-6 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <Loader2 size={18} className="animate-spin text-hc-brand" />
              <span className="text-sm font-medium text-hc-ink-2">{loadingMessages[msgIndex]}</span>
            </div>
          </motion.div>
        )}

        <p className="mx-auto mt-8 max-w-lg text-center text-xs leading-relaxed text-hc-caption">
          Your dashboard will be customized based on your selection. You can complete your professional profile after
          registration.
        </p>
      </motion.div>
    </div>
  );
}
