// Image uploads via Supabase Storage (Free plan — no credit card required).
// Firebase Storage requires the paid Blaze plan and Cloudinary blocks signups
// from Zimbabwe, so we use Supabase's browser-friendly REST API instead.
//
// Setup (once, free):
//   1. Create a free Supabase account at https://supabase.com (no card).
//   2. Start a new project (any region; "handyconnect" as name).
//   3. Storage → New bucket → name it "handyconnect" → Public bucket: ON.
//   4. Project Settings → API → copy "Project URL" and the "anon public" key.
//   5. Put them in .env:
//        VITE_SUPABASE_URL="https://xxxxxxxx.supabase.co"
//        VITE_SUPABASE_ANON_KEY="eyJ..."
//        VITE_SUPABASE_BUCKET="handyconnect"
//   6. If uploads are denied, add a policy (Storage → Policies or SQL Editor):
//        create policy "allow anon uploads" on storage.objects
//          for insert to anon, authenticated
//          with check (bucket_id = 'handyconnect');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'handyconnect';

// `path` like "posts/uid" maps to a folder. A trailing filename segment
// (e.g. "chats/conv/123_photo.png") is dropped from the folder.
const toFolder = (path) => {
  const parts = String(path || '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);
  if (parts.length && parts[parts.length - 1].includes('.')) parts.pop();
  return parts.join('/');
};

const MAX_BYTES = 2 * 1024 * 1024; // compress photos larger than 2 MB
const MAX_DIMENSION = 1600;
const COMPRESSIBLE = /^image\/(jpeg|png|webp)$/;

// Downscale + re-encode a large photo to JPEG so we don't burn through the
// Supabase free-tier quota. GIFs, SVGs and small files pass through untouched.
const compressImage = async (file) => {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read image.'));
      el.src = url;
    });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
};

// Upload an image file and return its public HTTPS URL.
export const uploadFile = async (file, path = '') => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Image uploads are not configured yet. Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_SUPABASE_BUCKET to .env (free Supabase account, no credit card needed).'
    );
  }
  if (!file) throw new Error('No file selected.');

  let upload = file;
  if (COMPRESSIBLE.test(file.type || '') && file.size > MAX_BYTES) {
    try { upload = await compressImage(file); } catch { /* keep the original */ }
  }

  const base = supabaseUrl.replace(/\/+$/, '');
  const folder = toFolder(path) || 'uploads';
  const safeName = upload.name.replace(/[^\w.-]+/g, '_').slice(0, 80);
  const objectKey = `${folder}/${Date.now()}_${safeName}`;
  const encodedPath = objectKey.split('/').map(encodeURIComponent).join('/');

  const response = await fetch(`${base}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': upload.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: upload,
  }).catch((err) => {
    throw new Error(
      err instanceof TypeError && /failed to fetch/i.test(err.message)
        ? 'Could not reach the image service. Check your internet connection and try again.'
        : err.message || 'Image upload failed.'
    );
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `Image upload failed (HTTP ${response.status}).`);
  }

  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
};

// Delete an object from storage. Throws if no delete policy is set on the
// bucket — callers should treat this as best-effort and clear their reference
// regardless.
export const deleteFile = async (url) => {
  if (!url || !supabaseUrl) return;
  const base = supabaseUrl.replace(/\/+$/, '');
  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefix)) return;
  const objectKey = decodeURIComponent(url.slice(prefix.length));
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${base}/storage/v1/object/${bucket}/${encodedKey}`, {
    method: 'DELETE',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `Image delete failed (HTTP ${response.status}).`);
  }
};
