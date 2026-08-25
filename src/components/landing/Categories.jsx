import { Wrench, Zap, Hammer, Sparkles, Paintbrush, HardHat, Truck, Droplet } from 'lucide-react';
import CategoryCard from './CategoryCard';

const CATEGORIES = [
  { name: 'Plumbing', icon: Wrench, desc: 'Leaks, pipes & installations' },
  { name: 'Electrical', icon: Zap, desc: 'Wiring, switches & repairs' },
  { name: 'Carpentry', icon: Hammer, desc: 'Furniture & woodwork' },
  { name: 'Painting', icon: Paintbrush, desc: 'Interior & exterior painting' },
  { name: 'Cleaning', icon: Sparkles, desc: 'Deep cleaning & home care' },
  { name: 'Construction', icon: HardHat, desc: 'Building & renovations' },
  { name: 'Automotive', icon: Truck, desc: 'Car repairs & servicing' },
  { name: 'Gardening', icon: Droplet, desc: 'Lawn care & landscaping' },
];

export default function Categories() {
  return (
    <section id="categories" className="scroll-mt-20 bg-[#F8FAFC] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-[#111827] sm:text-[38px]">
              Popular Categories
            </h2>
            <p className="mt-3 text-[17px] text-[#6B7280]">
              Find the right help for every job.
            </p>
          </div>
          <a
            href="/client/explore"
            className="hidden text-[15px] font-semibold text-[#6B7280] transition-colors hover:text-[#F97316] sm:inline-flex"
          >
            View all categories &rarr;
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.name} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
