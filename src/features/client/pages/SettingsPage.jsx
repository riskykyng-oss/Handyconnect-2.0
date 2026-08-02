import { useState } from 'react';
import {
  User, Phone, Mail, Lock, Trash2, Bell, MessageSquare,
  Briefcase, Heart, CreditCard, Sun, Globe, Type, Eye,
  Shield, MapPin, Download, HardDrive,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { isNotificationSoundEnabled, setNotificationSoundEnabled } from '@/services/notificationSound';

function SettingRow({ icon: Icon, label, description, right, divider }) {
  return (
    <>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          <Icon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {description && <p className="text-xs text-gray-500 truncate">{description}</p>}
        </div>
        {right}
      </div>
      {divider !== false && <div className="mx-5 border-t border-gray-100" />}
    </>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-orange-500' : 'bg-gray-300'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [toggles, setToggles] = useState({
    messages: true,
    jobs: true,
    community: false,
    payments: true,
    promotions: false,
    notifSound: isNotificationSoundEnabled(),
    darkMode: false,
    locationSharing: true,
  });

  const toggle = (key) => setToggles((prev) => {
    const next = { ...prev, [key]: !prev[key] };
    if (key === 'notifSound') setNotificationSoundEnabled(next[key]);
    return next;
  });

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and preferences.</p>
      </div>

      {/* Account */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Account</h3>
        <Card className="divide-y divide-gray-100 !p-0 overflow-hidden">
          <SettingRow icon={User} label="Personal Information" description="Dylan, dylan@email.com" />
          <SettingRow icon={Phone} label="Phone Number" description="+263 77 123 4567" />
          <SettingRow icon={Mail} label="Email" description="dylan@email.com" />
          <SettingRow icon={Lock} label="Password" description="Last changed 3 months ago" />
          <SettingRow icon={Trash2} label="Delete Account" description="Permanently remove your account" divider={false} />
        </Card>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Notifications</h3>
        <Card className="divide-y divide-gray-100 !p-0 overflow-hidden">
          <SettingRow icon={MessageSquare} label="Messages" right={<Toggle enabled={toggles.messages} onChange={() => toggle('messages')} />} />
          <SettingRow icon={Briefcase} label="Jobs" right={<Toggle enabled={toggles.jobs} onChange={() => toggle('jobs')} />} />
          <SettingRow icon={Heart} label="Community" right={<Toggle enabled={toggles.community} onChange={() => toggle('community')} />} />
          <SettingRow icon={CreditCard} label="Payments" right={<Toggle enabled={toggles.payments} onChange={() => toggle('payments')} />} />
          <SettingRow icon={Bell} label="Promotions" right={<Toggle enabled={toggles.promotions} onChange={() => toggle('promotions')} />} />
          <SettingRow icon={Bell} label="Notification Sound" right={<Toggle enabled={toggles.notifSound} onChange={() => toggle('notifSound')} />} divider={false} />
        </Card>
      </div>

      {/* Appearance */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Appearance</h3>
        <Card className="divide-y divide-gray-100 !p-0 overflow-hidden">
          <SettingRow icon={Sun} label="Dark Mode" right={<Toggle enabled={toggles.darkMode} onChange={() => toggle('darkMode')} />} />
          <SettingRow icon={Globe} label="Language" right={<span className="text-sm font-medium text-gray-700">English</span>} />
          <SettingRow icon={Type} label="Font Size" right={<span className="text-sm font-medium text-gray-700">Medium</span>} divider={false} />
        </Card>
      </div>

      {/* Privacy */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Privacy</h3>
        <Card className="divide-y divide-gray-100 !p-0 overflow-hidden">
          <SettingRow icon={Shield} label="Blocked Users" description="3 users blocked" />
          <SettingRow icon={Eye} label="Profile Visibility" description="Visible to everyone" />
          <SettingRow icon={MapPin} label="Location Sharing" right={<Toggle enabled={toggles.locationSharing} onChange={() => toggle('locationSharing')} />} divider={false} />
        </Card>
      </div>

      {/* App */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 px-1">App</h3>
        <Card className="divide-y divide-gray-100 !p-0 overflow-hidden">
          <SettingRow icon={Download} label="Clear Cache" description="245 MB" />
          <SettingRow icon={HardDrive} label="Storage" description="Using 1.2 GB" />
          <SettingRow icon={Globe} label="Version" description="1.0.0" divider={false} />
        </Card>
      </div>
    </div>
  );
}
