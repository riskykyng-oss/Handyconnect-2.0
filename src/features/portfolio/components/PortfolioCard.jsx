import { MapPin } from 'lucide-react';
import MediaCarousel from '@/features/community/components/MediaCarousel';
import BeforeAfterSlider from '@/features/community/components/BeforeAfterSlider';

export default function PortfolioCard({ item }) {
  const { title, trade, price, location, description, featured, images = [], beforeImage, afterImage } = item;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative">
        {beforeImage && afterImage ? (
          <BeforeAfterSlider before={beforeImage} after={afterImage} />
        ) : images.length > 1 ? (
          <MediaCarousel images={images} alt={title} />
        ) : images[0] ? (
          <img src={images[0]} alt={title} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="aspect-[4/3] w-full bg-gray-100" />
        )}
        {featured && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">Featured</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-xs font-semibold text-orange-600">{trade}</p>
          </div>
          {price && <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">{price}</span>}
        </div>
        {description && <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{description}</p>}
        {location && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
            <MapPin size={11} /> {location}
          </p>
        )}
      </div>
    </div>
  );
}
