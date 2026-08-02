import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

export default function VoicePlayer({ src, duration: initialDuration }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.onloadedmetadata = () => {
        setDuration(Math.floor(audioRef.current.duration));
        setLoading(false);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress(Math.floor(audioRef.current.currentTime));
        }
      };
      audioRef.current.onended = () => setPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
      <button
        onClick={toggle}
        disabled={loading}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-300">
        <div className="h-full rounded-full bg-orange-500 transition-all duration-200" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-[11px] font-medium text-gray-500">{fmt(playing ? progress : duration)}</span>
    </div>
  );
}
