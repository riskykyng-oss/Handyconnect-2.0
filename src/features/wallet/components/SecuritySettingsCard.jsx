import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { KeyRound, Lock, Fingerprint, ChevronRight, Loader2 } from 'lucide-react';
import SectionCard from '@/features/wallet/components/SectionCard';
import SecuritySetupModal from '@/features/wallet/components/SecuritySetupModal';
import { getSecurity, registerBiometric, removeBiometric } from '@/services/securityService';

export default function SecuritySettingsCard({ uid }) {
  const [security, setSecurity] = useState(() => getSecurity(uid));
  const [setup, setSetup] = useState(null); // 'pin' | 'password' | null
  const [busyBio, setBusyBio] = useState(false);

  const refresh = () => setSecurity(getSecurity(uid));

  const handleBiometric = async () => {
    if (busyBio) return;
    setBusyBio(true);
    try {
      if (security.biometric) {
        removeBiometric(uid);
        toast.success('Biometrics removed');
      } else {
        await registerBiometric(uid);
        toast.success('Biometrics registered');
      }
      refresh();
    } catch (e) {
      toast.error(e?.message || 'Biometrics are not available here.');
    } finally {
      setBusyBio(false);
    }
  };

  return (
    <>
      <SectionCard title="Security" subtitle="Protect every payment with a PIN, password or biometrics">
        <div className="space-y-2">
          <button onClick={() => setSetup('pin')} className="flex w-full items-center gap-3 rounded-xl border border-hc-hairline/80 p-3.5 text-left transition-colors hover:bg-hc-page dark:border-hc-ink dark:hover:bg-hc-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hc-brand-100 text-hc-ink-2 dark:bg-hc-ink dark:text-hc-ink-4"><KeyRound size={15} /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-hc-ink dark:text-white">Payment PIN</p>
              <p className="text-xs text-hc-ink-3">{security.pin ? 'Enabled · required for payments' : 'Disabled · not required'}</p>
            </div>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${security.pin ? 'bg-emerald-50 text-emerald-600' : 'bg-hc-brand-100 text-hc-ink-3'}`}>
              {security.pin ? 'ON' : 'OFF'}
            </span>
            <ChevronRight size={15} className="text-hc-ink-4" />
          </button>

          <button onClick={() => setSetup('password')} className="flex w-full items-center gap-3 rounded-xl border border-hc-hairline/80 p-3.5 text-left transition-colors hover:bg-hc-page dark:border-hc-ink dark:hover:bg-hc-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hc-brand-100 text-hc-ink-2 dark:bg-hc-ink dark:text-hc-ink-4"><Lock size={15} /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-hc-ink dark:text-white">Payment password</p>
              <p className="text-xs text-hc-ink-3">{security.password ? 'Enabled · required for payments' : 'Disabled · not required'}</p>
            </div>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${security.password ? 'bg-emerald-50 text-emerald-600' : 'bg-hc-brand-100 text-hc-ink-3'}`}>
              {security.password ? 'ON' : 'OFF'}
            </span>
            <ChevronRight size={15} className="text-hc-ink-4" />
          </button>

          <button onClick={handleBiometric} disabled={busyBio} className="flex w-full items-center gap-3 rounded-xl border border-hc-hairline/80 p-3.5 text-left transition-colors hover:bg-hc-page disabled:opacity-60 dark:border-hc-ink dark:hover:bg-hc-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hc-brand-100 text-hc-ink-2 dark:bg-hc-ink dark:text-hc-ink-4"><Fingerprint size={15} /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-hc-ink dark:text-white">Biometric / Face ID</p>
              <p className="text-xs text-hc-ink-3">{security.biometric ? 'Registered · unlock with fingerprint' : 'Not registered'}</p>
            </div>
            {busyBio ? (
              <Loader2 size={15} className="animate-spin text-hc-ink-3" />
            ) : (
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${security.biometric ? 'bg-emerald-50 text-emerald-600' : 'bg-hc-brand-100 text-hc-ink-2 dark:bg-hc-ink dark:text-hc-ink-4'}`}>
                {security.biometric ? 'REMOVE' : 'SET UP'}
              </span>
            )}
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-hc-ink-3">
          When any factor is enabled, you will be asked to verify before adding funds, paying or withdrawing. PINs and passwords are stored as salted hashes — never in plain text.
        </p>
      </SectionCard>

      {setup && (
        <SecuritySetupModal
          key={setup}
          uid={uid}
          mode={setup}
          onClose={() => {
            setSetup(null);
            refresh();
          }}
        />
      )}
    </>
  );
}
