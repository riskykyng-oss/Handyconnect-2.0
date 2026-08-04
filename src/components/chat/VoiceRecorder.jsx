import { useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';

const MIME_TYPES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];

export default function VoiceRecorder({ onRecorded, recording, onStart, onStop, className = '' }) {
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const recordingRef = useRef(false);
  const startTime = useRef(0);

  const startRecording = useCallback(async (e) => {
    e.preventDefault();
    e.currentTarget?.setPointerCapture?.(e.pointerId);
    recordingRef.current = true;
    if (typeof MediaRecorder === 'undefined') {
      recordingRef.current = false;
      alert('Voice recording is not supported on this browser');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!recordingRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const mime = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorder.current = recorder;
      chunks.current = [];
      startTime.current = Date.now();
      recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.current.push(ev.data); };
      recorder.onstop = () => {
        const isMp4 = (recorder.mimeType || mime).includes('mp4');
        const ext = isMp4 ? 'm4a' : 'webm';
        const type = isMp4 ? 'audio/mp4' : 'audio/webm';
        const blob = new Blob(chunks.current, { type });
        const duration = Math.max(1, Math.round((Date.now() - startTime.current) / 1000));
        const f = new File([blob], `voice-${Date.now()}.${ext}`, { type });
        onRecorded(f, duration);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      onStart?.();
    } catch {
      recordingRef.current = false;
      alert('Microphone access denied');
    }
  }, [onRecorded, onStart]);

  const stopRecording = useCallback(() => {
    recordingRef.current = false;
    const recorder = mediaRecorder.current;
    if (recorder && recorder.state === 'recording') recorder.stop();
    onStop?.();
  }, [onStop]);

  return (
    <button
      type="button"
      onPointerDown={startRecording}
      onPointerUp={stopRecording}
      onPointerCancel={stopRecording}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Record voice message"
      className={`touch-none select-none rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${recording ? 'text-red-500' : 'text-gray-400 hover:text-hc-ink-2'} ${className}`}
    >
      <Mic size={20} />
    </button>
  );
}
