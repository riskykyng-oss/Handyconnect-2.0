import { useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';

export default function VoiceRecorder({ onRecorded, recording, onStart, onStop, className = '' }) {
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const f = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        onRecorded(f);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current.start();
      onStart?.();
    } catch {
      alert('Microphone access denied');
    }
  }, [onRecorded, onStart]);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    onStop?.();
  }, [onStop]);

  return (
    <button
      type="button"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={`rounded-xl p-2 transition-colors hover:bg-gray-100 ${recording ? 'text-red-500' : 'text-gray-400 hover:text-orange-500'} ${className}`}
    >
      <Mic size={20} />
    </button>
  );
}
