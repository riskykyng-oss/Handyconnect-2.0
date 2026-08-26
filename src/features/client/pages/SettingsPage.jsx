import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile as updateAuthProfile,
  deleteUser,
} from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import {
  User, Phone, Mail, Lock, Trash2, Bell, MessageSquare,
  Briefcase, Heart, CreditCard, Type, MapPin, Download, Globe, ChevronRight,
} from 'lucide-react';
import { auth, db } from '@/firebase/config';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { isNotificationSoundEnabled, setNotificationSoundEnabled } from '@/services/notificationSound';
import { getPrefs, setPref } from '@/services/notificationPrefs';
import pkg from '../../../../package.json';

const FONT_SIZES = { small: '14px', medium: '16px', large: '18px' };
const FONT_LABELS = { small: 'Small', medium: 'Medium', large: 'Large' };
const FONT_KEY = 'handyconnect:fontSize';

const getStoredFontSize = () => {
  try {
    return localStorage.getItem(FONT_KEY) || 'medium';
  } catch {
    return 'medium';
  }
};

const setStoredFontSize = (size) => {
  try {
    localStorage.setItem(FONT_KEY, size);
  } catch {
    // storage unavailable
  }
};

const applyFontSize = (size) => {
  document.documentElement.style.fontSize = FONT_SIZES[size] || '16px';
};

const getAuthError = (err) => {
  switch (err?.code) {
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'That email is already in use';
    case 'auth/invalid-email':
      return 'Enter a valid email address';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/requires-recent-login':
      return 'Please sign in again to continue';
    default:
      return err?.message || 'Something went wrong';
  }
};

function SettingRow({ icon: Icon, label, description, right, onClick, danger, divider }) {
  const content = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-hc-brand-100 text-hc-ink-2'}`}>
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${danger ? 'text-red-600' : 'text-hc-ink'}`}>{label}</span>
        {description && <span className="block truncate text-xs text-hc-caption">{description}</span>}
      </span>
    </>
  );
  return (
    <>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-hc-page/70"
        >
          {content}
          {right || <ChevronRight size={15} className="shrink-0 text-hc-ink-3" />}
        </button>
      ) : (
        <div className="flex items-center gap-4 px-5 py-4">{content}{right}</div>
      )}
      {divider !== false && <div className="mx-5 border-t border-black/[0.07]" />}
    </>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-hc-brand' : 'bg-hc-ink-4'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;
  const [profile, setProfile] = useState(null);
  const [toggles, setToggles] = useState(() => ({
    ...getPrefs(),
    notifSound: isNotificationSoundEnabled(),
  }));
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(() => getStoredFontSize());

  useEffect(() => {
    if (!currentUser) return;
    getUserProfile(currentUser.uid)
      .then(setProfile)
      .catch(() => {});
  }, [currentUser]);

  useEffect(() => {
    applyFontSize(fontSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = profile?.displayName || currentUser?.displayName || '—';
  const email = currentUser?.email || profile?.email || '—';
  const phone = profile?.phoneNumber || currentUser?.phoneNumber || 'Not set';

  const toggle = (key) => {
    const next = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: next }));
    if (key === 'notifSound') setNotificationSoundEnabled(next);
    else setPref(key, next);
  };

  const openModal = (name) => {
    setError('');
    setForm({});
    setModal(name);
  };

  const reauth = async (password) => {
    const user = auth.currentUser;
    if (!user?.email) throw new Error('Unable to re-authenticate this account');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  };

  const saveName = async () => {
    const name = form.name?.trim();
    if (!name) return setError('Enter your name');
    setBusy(true);
    setError('');
    try {
      await updateUserProfile(uid, { displayName: name });
      await updateAuthProfile(auth.currentUser, { displayName: name });
      setProfile((p) => ({ ...p, displayName: name }));
      toast.success('Name updated');
      setModal(null);
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const savePhone = async () => {
    const value = form.phone?.trim();
    if (!value) return setError('Enter your phone number');
    setBusy(true);
    setError('');
    try {
      await updateUserProfile(uid, { phoneNumber: value });
      setProfile((p) => ({ ...p, phoneNumber: value }));
      toast.success('Phone number updated');
      setModal(null);
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const saveEmail = async () => {
    const newEmail = form.newEmail?.trim();
    const password = form.password || '';
    if (!newEmail) return setError('Enter your new email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return setError('Enter a valid email address');
    if (newEmail === email) return setError('New email is the same as your current email');
    if (!password) return setError('Enter your password to confirm');
    setBusy(true);
    setError('');
    try {
      await reauth(password);
      await updateEmail(auth.currentUser, newEmail);
      await updateUserProfile(uid, { email: newEmail });
      toast.success('Email updated');
      setModal(null);
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    const { current, next, confirm } = form;
    if (!current) return setError('Enter your current password');
    if (!next || next.length < 6) return setError('New password must be at least 6 characters');
    if (next !== confirm) return setError('Passwords do not match');
    setBusy(true);
    setError('');
    try {
      await reauth(current);
      await updatePassword(auth.currentUser, next);
      toast.success('Password updated');
      setModal(null);
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    const password = form.password || '';
    if (!password) return setError('Enter your password to confirm');
    setBusy(true);
    setError('');
    try {
      await reauth(password);
      await deleteUser(auth.currentUser);
      await deleteDoc(doc(db, 'users', uid)).catch(() => {});
      await logout().catch(() => {});
      toast.success('Account deleted');
      navigate('/', { replace: true });
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const chooseFontSize = (size) => {
    setFontSize(size);
    setStoredFontSize(size);
    applyFontSize(size);
    setModal(null);
    toast.success(`Font size set to ${FONT_LABELS[size]}`);
  };

  const clearCache = () => {
    const keys = [];
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith('hc_')) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    toast.success('Cache cleared');
    setTimeout(() => window.location.reload(), 600);
  };

  const cardClass = 'divide-y divide-black/[0.07] !p-0 overflow-hidden !rounded-xl !border-black/[0.07]';
  const sectionTitle = 'mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-hc-caption';

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-hc-ink">Settings</h1>
        <p className="mt-1 text-sm text-hc-caption">Manage your account and preferences.</p>
      </div>

      <div>
        <h3 className={sectionTitle}>Account</h3>
        <Card className={cardClass}>
          <SettingRow icon={User} label="Personal Information" description={displayName} onClick={() => openModal('name')} />
          <SettingRow icon={Phone} label="Phone Number" description={phone} onClick={() => openModal('phone')} />
          <SettingRow icon={Mail} label="Email" description={email} onClick={() => openModal('email')} />
          <SettingRow icon={Lock} label="Password" description="Change your password" onClick={() => openModal('password')} />
          <SettingRow icon={Trash2} label="Delete Account" description="Permanently remove your account" danger onClick={() => openModal('delete')} divider={false} />
        </Card>
      </div>

      <div>
        <h3 className={sectionTitle}>Notifications</h3>
        <Card className={cardClass}>
          <SettingRow icon={MessageSquare} label="Messages" description="New message alerts" right={<Toggle enabled={toggles.messages} onChange={() => toggle('messages')} />} />
          <SettingRow icon={Briefcase} label="Jobs" description="Job activity and updates" right={<Toggle enabled={toggles.jobs} onChange={() => toggle('jobs')} />} />
          <SettingRow icon={Heart} label="Community" description="Posts, stories and group activity" right={<Toggle enabled={toggles.community} onChange={() => toggle('community')} />} />
          <SettingRow icon={CreditCard} label="Payments" description="Payments and wallet activity" right={<Toggle enabled={toggles.payments} onChange={() => toggle('payments')} />} />
          <SettingRow icon={Bell} label="Promotions" description="Offers and recommendations" right={<Toggle enabled={toggles.promotions} onChange={() => toggle('promotions')} />} />
          <SettingRow icon={Bell} label="Notification Sound" description="Play a sound for new alerts" right={<Toggle enabled={toggles.notifSound} onChange={() => toggle('notifSound')} />} divider={false} />
        </Card>
      </div>

      <div>
        <h3 className={sectionTitle}>Appearance</h3>
        <Card className={cardClass}>
          <SettingRow
            icon={Type}
            label="Font Size"
            description={`${FONT_LABELS[fontSize]} text size`}
            right={<span className="text-sm font-medium text-hc-ink-2">{FONT_LABELS[fontSize]}</span>}
            onClick={() => openModal('font')}
            divider={false}
          />
        </Card>
      </div>

      <div>
        <h3 className={sectionTitle}>Privacy</h3>
        <Card className={cardClass}>
          <SettingRow icon={MapPin} label="Location Sharing" description="Share your location for better service" right={<Toggle enabled={toggles.locationSharing} onChange={() => toggle('locationSharing')} />} divider={false} />
        </Card>
      </div>

      <div>
        <h3 className={sectionTitle}>App</h3>
        <Card className={cardClass}>
          <SettingRow icon={Download} label="Clear Cache" description="Remove stored app data" onClick={clearCache} />
          <SettingRow icon={Globe} label="Version" description={`v${pkg.version}`} divider={false} />
        </Card>
      </div>

      <Modal open={modal === 'name'} onClose={() => setModal(null)} title="Personal Information">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name ?? displayName} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={saveName} loading={busy}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'phone'} onClose={() => setModal(null)} title="Phone Number">
        <div className="space-y-4">
          <Input label="Phone Number" type="tel" value={form.phone ?? phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+263 77 000 0000" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={savePhone} loading={busy}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'email'} onClose={() => setModal(null)} title="Change Email">
        <div className="space-y-4">
          <Input label="Current Email" value={email} disabled />
          <Input label="New Email" type="email" value={form.newEmail ?? ''} onChange={(e) => setForm({ ...form, newEmail: e.target.value })} placeholder="new@email.com" />
          <Input label="Current Password" type="password" value={form.password ?? ''} onChange={(e) => setForm({ ...form, password: e.target.value })} hint="Enter your password to confirm the change" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={saveEmail} loading={busy}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'password'} onClose={() => setModal(null)} title="Change Password">
        <div className="space-y-4">
          <Input label="Current Password" type="password" value={form.current ?? ''} onChange={(e) => setForm({ ...form, current: e.target.value })} />
          <Input label="New Password" type="password" value={form.next ?? ''} onChange={(e) => setForm({ ...form, next: e.target.value })} />
          <Input label="Confirm New Password" type="password" value={form.confirm ?? ''} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={savePassword} loading={busy}>Update</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Delete Account">
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            This permanently deletes your account and all your data. This action cannot be undone.
          </div>
          <Input label="Password" type="password" value={form.password ?? ''} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password to confirm" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={deleteAccount} loading={busy}>Delete my account</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'font'} onClose={() => setModal(null)} title="Font Size">
        <div className="space-y-2">
          {Object.entries(FONT_SIZES).map(([key, px]) => (
            <button
              key={key}
              type="button"
              onClick={() => chooseFontSize(key)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${fontSize === key ? 'border-hc-brand bg-hc-tint' : 'border-black/[0.08] bg-white hover:bg-hc-page'}`}
            >
              <span className="text-sm font-semibold text-hc-ink">{FONT_LABELS[key]}</span>
              <span className="text-hc-caption" style={{ fontSize: px }}>Aa</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
