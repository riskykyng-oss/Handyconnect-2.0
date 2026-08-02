/* Client-side security for the demo:
   - PIN / payment password stored as a salted SHA-256 hash (never plaintext).
   - Biometric/Face ID via the WebAuthn platform authenticator.
   - 5 failed attempts -> 30s lockout.
   All state lives in localStorage under hc_security_<uid> (demo scope). */

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30 * 1000;

const key = (uid) => `hc_security_${uid}`;
const saltKey = (uid) => `hc_salt_${uid}`;

const load = (uid) => {
  try {
    return JSON.parse(localStorage.getItem(key(uid))) || {};
  } catch {
    return {};
  }
};

const save = (uid, data) => localStorage.setItem(key(uid), JSON.stringify(data));

const bufToB64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let s = '';
  bytes.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const b64ToBuf = (b64) => {
  const b = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b.padEnd(Math.ceil(b.length / 4) * 4, '=');
  const bin = atob(pad);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  return arr;
};

const getSalt = (uid) => {
  let salt = localStorage.getItem(saltKey(uid));
  if (!salt) {
    salt = bufToB64(crypto.getRandomValues(new Uint8Array(16)));
    localStorage.setItem(saltKey(uid), salt);
  }
  return salt;
};

const sha256Hex = async (text) => {
  if (!window.crypto?.subtle) throw new Error('Security features require a secure connection (HTTPS or localhost)');
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const hashSecret = (uid, secret) => sha256Hex(`${getSalt(uid)}:${secret}`);

/* ─── VALIDATION ─── */

export const validatePin = (pin) => /^\d{4,6}$/.test(String(pin));
export const validatePassword = (pwd) => typeof pwd === 'string' && pwd.trim().length >= 6;

/* ─── LOCKOUT ─── */

export const lockInfo = (uid) => {
  const s = load(uid);
  const remaining = Math.max(0, (s.lockUntil || 0) - Date.now());
  return { locked: remaining > 0, remainingSec: Math.ceil(remaining / 1000) };
};

const noteFailure = (uid) => {
  const s = load(uid);
  const failed = (s.failed || 0) + 1;
  if (failed >= MAX_ATTEMPTS) {
    s.failed = 0;
    s.lockUntil = Date.now() + LOCK_MS;
  } else {
    s.failed = failed;
  }
  save(uid, s);
};

const resetFailures = (uid) => {
  const s = load(uid);
  if (s.failed || s.lockUntil) {
    s.failed = 0;
    s.lockUntil = 0;
    save(uid, s);
  }
};

/* ─── STATE ─── */

// What factors are configured & enforced for this account.
export const getSecurity = (uid) => {
  const s = load(uid);
  return {
    pin: !!(s.pinEnabled && s.pinHash),
    password: !!(s.passwordEnabled && s.passwordHash),
    biometric: !!(s.biometricEnabled && s.biometric?.id),
  };
};

export const securityRequired = (uid) => {
  const s = load(uid);
  return (s.pinEnabled && s.pinHash) || (s.passwordEnabled && s.passwordHash) || (s.biometricEnabled && s.biometric?.id);
};

/* ─── PIN ─── */

export const setPin = async (uid, pin) => {
  if (!validatePin(pin)) throw new Error('PIN must be 4-6 digits');
  const s = load(uid);
  s.pinHash = await hashSecret(uid, pin);
  s.pinEnabled = true;
  save(uid, s);
};

export const removePin = (uid) => {
  const s = load(uid);
  s.pinHash = null;
  s.pinEnabled = false;
  save(uid, s);
};

export const verifyPin = async (uid, pin) => {
  const info = lockInfo(uid);
  if (info.locked) return { ok: false, locked: true, remainingSec: info.remainingSec, error: 'Too many attempts. Try again shortly.' };
  const s = load(uid);
  if (!s.pinHash) return { ok: false, error: 'No PIN set' };
  const hash = await hashSecret(uid, pin);
  if (hash === s.pinHash) {
    resetFailures(uid);
    return { ok: true };
  }
  noteFailure(uid);
  const after = lockInfo(uid);
  return { ok: false, locked: after.locked, remainingSec: after.remainingSec, error: after.locked ? 'Too many attempts. Try again shortly.' : 'Incorrect PIN' };
};

/* ─── PAYMENT PASSWORD ─── */

export const setPassword = async (uid, password) => {
  if (!validatePassword(password)) throw new Error('Password must be at least 6 characters');
  const s = load(uid);
  s.passwordHash = await hashSecret(uid, password);
  s.passwordEnabled = true;
  save(uid, s);
};

export const removePassword = (uid) => {
  const s = load(uid);
  s.passwordHash = null;
  s.passwordEnabled = false;
  save(uid, s);
};

export const verifyPassword = async (uid, password) => {
  const info = lockInfo(uid);
  if (info.locked) return { ok: false, locked: true, remainingSec: info.remainingSec, error: 'Too many attempts. Try again shortly.' };
  const s = load(uid);
  if (!s.passwordHash) return { ok: false, error: 'No password set' };
  const hash = await hashSecret(uid, password);
  if (hash === s.passwordHash) {
    resetFailures(uid);
    return { ok: true };
  }
  noteFailure(uid);
  const after = lockInfo(uid);
  return { ok: false, locked: after.locked, remainingSec: after.remainingSec, error: after.locked ? 'Too many attempts. Try again shortly.' : 'Incorrect password' };
};

/* ─── BIOMETRIC (WebAuthn platform authenticator) ─── */

export const registerBiometric = async (uid) => {
  if (!window.PublicKeyCredential) throw new Error('Biometrics are not supported in this browser');
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'HandyConnect', id: window.location.hostname },
      user: { id: new TextEncoder().encode(uid), name: 'HandyConnect User', displayName: 'HandyConnect User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: { userVerification: 'preferred', authenticatorAttachment: 'platform', residentKey: 'discouraged' },
    },
  });
  if (!cred) throw new Error('Biometric registration cancelled');
  const s = load(uid);
  s.biometric = { id: bufToB64(cred.rawId), registeredAt: Date.now() };
  s.biometricEnabled = true;
  save(uid, s);
  return true;
};

export const removeBiometric = (uid) => {
  const s = load(uid);
  s.biometric = null;
  s.biometricEnabled = false;
  save(uid, s);
};

// Prompts the OS fingerprint/Face ID prompt. Resolves true only if the user
// authenticates on the same registered credential.
export const verifyBiometric = async (uid) => {
  const s = load(uid);
  if (!s.biometric?.id || !window.PublicKeyCredential) return false;
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ type: 'public-key', id: b64ToBuf(s.biometric.id), transports: ['internal'] }],
      timeout: 60000,
      userVerification: 'required',
    },
  });
  return !!assertion && bufToB64(assertion.rawId) === s.biometric.id;
};
