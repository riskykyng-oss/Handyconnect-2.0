import { useState } from 'react';
import { Send, X, Loader2, MapPin } from 'lucide-react';
import ImagePicker from './ImagePicker';
import VoiceRecorder from './VoiceRecorder';
import LocationButton from './LocationButton';

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(0);
  const [recording, setRecording] = useState(false);
  const [locationMode, setLocationMode] = useState(false);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim() && !file && !locationMode) return;

    if (locationMode) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSend(text.trim(), null, {
            type: 'location',
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          });
          setText('');
          setLocationMode(false);
        },
        () => alert('Could not get location'),
        { enableHighAccuracy: true }
      );
      return;
    }

    onSend(text.trim(), file, { duration: fileDuration });
    setText('');
    setFile(null);
    setFileDuration(0);
  };

  return (
    <form onSubmit={handleSend} className="border-t border-black/[0.08] bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-gray-700 dark:bg-gray-800">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-hc-ink-2 dark:bg-gray-700 dark:text-gray-300">
          {file.type.startsWith('image/') ? '📷' : file.type.startsWith('audio/') ? '🎤' : '📎'}
          <span className="flex-1 truncate">{file.name}</span>
          <button type="button" aria-label="Remove attachment" onClick={() => setFile(null)} className="shrink-0 text-gray-400 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      )}
      {locationMode && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-hc-ink-2 dark:bg-gray-700 dark:text-gray-300">
          <MapPin size={14} />
          Location sharing enabled — send to share your current location
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1">
          <ImagePicker onPick={(f) => setFile(f)} />
          <VoiceRecorder
            onRecorded={(f, duration) => { setFile(f); setFileDuration(duration || 0); }}
            recording={recording}
            onStart={() => setRecording(true)}
            onStop={() => setRecording(false)}
          />
          <LocationButton
            active={locationMode}
            onClick={() => setLocationMode((p) => !p)}
          />
        </div>
        <input
          aria-label="Message"
          placeholder={recording ? 'Recording...' : locationMode ? 'Add a note with your location...' : 'Type a message...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[16px] outline-none transition-all focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          disabled={recording}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={(!text.trim() && !file && !locationMode) || loading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-hc-brand text-white shadow-sm transition-all hover:bg-hc-brand-strong disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={19} />}
        </button>
      </div>
    </form>
  );
}
