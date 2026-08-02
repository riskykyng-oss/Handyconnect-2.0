const STORAGE_KEY = 'handyconnect:notifSound';

let audioCtx = null;
const sounded = new Set();

const getCtx = () => {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
};

export const playNotificationSound = () => {
  if (localStorage.getItem(STORAGE_KEY) === 'off') return;
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  [
    [880, 0, 0.14, 0.22],
    [1174.66, 0.15, 0.3, 0.2],
  ].forEach(([freq, start, dur, peak]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(peak, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  });
};

export const isNotificationSoundEnabled = () => localStorage.getItem(STORAGE_KEY) !== 'off';

export const setNotificationSoundEnabled = (on) => {
  localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
};

export const handleNotifications = (list, { first = false } = {}) => {
  if (!list || !list.length) return;
  if (first) {
    list.forEach((n) => n?.id && sounded.add(n.id));
    return;
  }
  const newest = list[0];
  if (newest && newest.id && !sounded.has(newest.id)) {
    sounded.add(newest.id);
    playNotificationSound();
  }
};
