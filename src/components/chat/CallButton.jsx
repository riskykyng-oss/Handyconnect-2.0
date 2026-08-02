import { Phone, PhoneOff, Loader2 } from 'lucide-react';

export default function CallButton({ onCall, onEndCall, callState, className = '' }) {
  if (callState === 'ringing' || callState === 'answered') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs font-medium text-green-600">
          {callState === 'ringing' ? 'Calling...' : 'In call'}
        </span>
        <button
          onClick={onEndCall}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-400"
        >
          <PhoneOff size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onCall}
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white transition-all hover:bg-orange-400 disabled:opacity-50 ${className}`}
    >
      <Phone size={16} />
    </button>
  );
}
