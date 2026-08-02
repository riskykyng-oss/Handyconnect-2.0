import { useState } from 'react';
import { Send, X, Loader2, MapPin } from 'lucide-react';
import ImagePicker from './ImagePicker';
import VoiceRecorder from './VoiceRecorder';
import LocationButton from './LocationButton';

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
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

    onSend(text.trim(), file, {});
    setText('');
    setFile(null);
  };

  return (
    <form onSubmit={handleSend} className="border-t border-gray-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
          {file.type.startsWith('image/') ? '📷' : file.type.startsWith('audio/') ? '🎤' : '📎'}
          <span className="flex-1 truncate">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="shrink-0 text-gray-400 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      )}
      {locationMode && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
          <MapPin size={14} />
          Location sharing enabled — send to share your current location
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1">
          <ImagePicker onPick={(f) => setFile(f)} />
          <VoiceRecorder
            onRecorded={(f) => setFile(f)}
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
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          disabled={recording}
        />
        <button
          type="submit"
          disabled={(!text.trim() && !file && !locationMode) || loading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm transition-all hover:bg-orange-400 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </form>
  );
}
