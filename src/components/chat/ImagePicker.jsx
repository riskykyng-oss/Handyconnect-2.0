import { useRef } from 'react';
import { ImagePlus } from 'lucide-react';

export default function ImagePicker({ onPick, className = '' }) {
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onPick(f);
    e.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        aria-label="Attach image"
        onClick={() => fileRef.current?.click()}
        className={`rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-hc-ink-2 dark:hover:bg-gray-700 ${className}`}
      >
        <ImagePlus size={20} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </>
  );
}
