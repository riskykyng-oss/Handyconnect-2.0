import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Briefcase, CheckCircle, Wallet, MapPin, Shield, HelpCircle, LogOut,
  ChevronRight, Settings, Clock, Camera, Star,
  Loader2, Trash2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { uploadFile, deleteFile } from '@/services/storageService';
import { getClientJobs } from '@/services/jobService';
import { subscribeToWallet } from '@/services/walletService';
import { timeAgo } from '@/utils/time';

const COVER = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

function SectionHeading({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
          <Icon size={16} />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-hc-ink">{title}</h2>
      </div>
      {action && (
        <button className="text-xs font-semibold text-hc-ink-2 transition-colors hover:text-hc-brand">{action}</button>
      )}
    </div>
  );
}

export default function ClientProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    getUserProfile(currentUser.uid)
      .then((p) => { if (p?.photoURL) setAvatar(p.photoURL); })
      .catch(() => {});
    getClientJobs(currentUser.uid).then(setJobs).catch(() => setJobs([]));
    return subscribeToWallet(currentUser.uid, setWallet);
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setPhotoBusy(true);
    try {
      const url = await uploadFile(file);
      const old = avatar;
      setAvatar(url);
      await updateUserProfile(currentUser.uid, { photoURL: url });
      if (old) deleteFile(old).catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentUser) return;
    const old = avatar;
    setAvatar(null);
    try {
      await updateUserProfile(currentUser.uid, { photoURL: null });
      if (old) deleteFile(old).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  const greeting = useMemo(() => getGreeting(), []);

  const completed = jobs.filter((j) => j.status === 'completed').length;
  const inProgress = jobs.filter((j) => j.status === 'assigned').length;
  const open = jobs.filter((j) => j.status === 'open').length;
  const balance = Number(wallet?.balance || 0);

  const activity = useMemo(() => {
    const sorted = [...jobs].sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return tb.getTime() - ta.getTime();
    });
    return sorted.slice(0, 6).map((j) => ({
      text: j.status === 'completed' ? `Completed "${j.title}"` : j.status === 'assigned' ? `Started "${j.title}"` : `Posted "${j.title}"`,
      time: timeAgo(j.createdAt?.toDate ? j.createdAt.toDate() : j.createdAt),
      icon: j.status === 'completed' ? CheckCircle : j.status === 'assigned' ? Clock : Briefcase,
    }));
  }, [jobs]);

  const statCards = [
    { label: 'Jobs Posted', value: jobs.length, icon: Briefcase, color: 'text-gray-500', bg: 'bg-gray-100' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
    { label: 'Open', value: open, icon: Star, color: 'text-gray-500', bg: 'bg-gray-100' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-7 pb-24 lg:pb-10">
      {/* Cover Photo */}
      <motion.div variants={itemAnim} className="relative -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-0 xl:rounded-2xl overflow-hidden">
        <div className="relative h-44 sm:h-52 lg:h-56 overflow-hidden">
          <img src={COVER} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
          <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-8">
            <p className="text-sm font-semibold text-white/80">{greeting}</p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow-sm">
              {currentUser?.displayName || 'Client'}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70">
              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-400" /> Verified Client</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {wallet?.currency || 'Zimbabwe'}</span>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <Camera size={17} />
          </button>
        </div>
      </motion.div>

      {/* Profile Header + Stats */}
      <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
        {/* Left: Avatar + Info */}
        <motion.div variants={itemAnim} className="xl:col-span-1">
          <Card className="relative !p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200 border-[3px] border-white shadow-md">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User size={28} className="absolute inset-0 m-auto text-gray-400" />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 left-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-hc-brand text-white shadow-md hover:bg-hc-brand-strong transition-colors"
                >
                  {photoBusy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                {avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    className="absolute -left-1 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-red-500 shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <div className="absolute -right-1 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-hc-brand text-white shadow-md">
                  <CheckCircle size={14} />
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handlePhotoUpload(e); e.target.value = ''; }} />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-hc-ink">{currentUser?.displayName || 'Client'}</h2>
              <p className="text-xs text-hc-caption">{currentUser?.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="success" className="text-[10px]">Verified Client</Badge>
                <Badge variant="neutral" className="text-[10px]">{jobs.length} Jobs</Badge>
              </div>
              <div className="mt-4 flex w-full items-center justify-center gap-6 text-center">
                <div>
                  <p className="text-lg font-semibold text-hc-ink">{jobs.length}</p>
                  <p className="text-[10px] font-medium text-hc-caption">Posted</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <p className="text-lg font-semibold text-hc-ink">{completed}</p>
                  <p className="text-[10px] font-medium text-hc-caption">Done</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <p className="text-lg font-semibold text-hc-ink">{inProgress}</p>
                  <p className="text-[10px] font-medium text-hc-caption">Active</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right: Stats Cards */}
        <motion.div variants={itemAnim} className="xl:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.label}
                  whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/client/jobs')}
                  className="rounded-xl border border-black/[0.07] bg-white p-5 text-left shadow-sm transition-shadow"
                >
                  <div className={`mb-1 flex h-8 w-8 items-center justify-center rounded-xl ${s.bg}`}>
                    <Icon size={16} className={s.color} />
                  </div>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-hc-ink">{s.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-hc-caption">{s.label}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Two-column layout for the rest */}
      <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-7 xl:col-span-2">
          {/* Recent Activity */}
          <motion.div variants={itemAnim}>
            <SectionHeading icon={Clock} title="Recent Activity" action="My Jobs" />
            <Card className="divide-y divide-black/[0.07] !p-0 overflow-hidden !rounded-xl !border-black/[0.07]">
              {activity.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-hc-ink-2">No activity yet</p>
                  <p className="mt-1 text-xs text-hc-caption">Post your first job to get started.</p>
                </div>
              ) : (
                activity.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                        <Icon size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-hc-ink truncate">{a.text}</p>
                        <p className="text-xs text-hc-caption">{a.time}</p>
                      </div>
                      <ChevronRight size={14} className="shrink-0 text-gray-300" />
                    </motion.div>
                  );
                })
              )}
            </Card>
          </motion.div>

          {/* Wallet */}
          <motion.div variants={itemAnim}>
            <SectionHeading icon={Wallet} title="Wallet" action="View" />
            <Card className="!p-5 !rounded-xl !border-black/[0.07]">
              <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Available Balance</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">${balance.toFixed(2)}</p>
                <p className="mt-1 text-[10px] text-gray-400">{wallet?.currency || 'USD'} · updates in real time</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-7">
          {/* Quick Menu */}
          <motion.div variants={itemAnim}>
            <SectionHeading icon={Settings} title="Quick Settings" />
            <Card className="divide-y divide-black/[0.07] !p-0 overflow-hidden !rounded-xl !border-black/[0.07]">
              {[
                { label: 'My Jobs', icon: Briefcase, route: '/client/jobs' },
                { label: 'Explore Professionals', icon: User, route: '/client/explore' },
                { label: 'Wallet', icon: Wallet, route: '/client/wallet' },
                { label: 'Help Center', icon: HelpCircle, route: '/client/help' },
                { label: 'Settings', icon: Settings, route: '/client/settings' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.route)}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                      <Icon size={15} />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-hc-ink">{item.label}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                );
              })}
            </Card>
          </motion.div>

          {/* Trust */}
          <motion.div variants={itemAnim}>
            <SectionHeading icon={Shield} title="Trust & Safety" />
            <Card className="!p-5 !rounded-xl !border-black/[0.07]">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Shield size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-hc-ink">Verified Client</p>
                  <p className="mt-0.5 text-xs text-hc-caption">Your account and activity are protected by HandyConnect.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Logout */}
      <motion.div variants={itemAnim}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-5 py-4 text-sm font-semibold text-red-500 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50"
        >
          <LogOut size={16} /> Logout
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
