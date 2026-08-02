import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MediaCarousel({ images = [], alt = 'Post media' }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;

  return (
    <div className="relative group">
      <div className="relative max-h-[520px] w-full overflow-hidden bg-gray-100">
        <img src={images[index]} alt={`${alt} ${index + 1}`} className="max-h-[520px] w-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-800 shadow-sm transition-opacity hover:bg-white opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-800 shadow-sm transition-opacity hover:bg-white opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2.5 py-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
