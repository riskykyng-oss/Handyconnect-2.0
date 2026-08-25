import { useEffect, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { subscribeProfessionals } from '@/services/userService';
import HeroSearchBar from './HeroSearchBar';

const heroImage =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85';

export default function Hero() {
  const [proCount, setProCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeProfessionals((list) => setProCount(list.length));
    return unsub;
  }, []);

  return (
    <section className="bg-white pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
        {/* Left: Text + Search */}
        <div className="flex flex-col items-start">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7ED] px-4 py-1.5 text-[13px] font-semibold text-[#F97316]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
            Zimbabwe&apos;s trusted services marketplace
          </span>

          {/* Heading */}
          <h1 className="mt-7 font-display text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.06] tracking-[-0.03em] text-[#111827]">
            Find trusted<br />
            <span className="text-[#F97316]">professionals.</span><br />
            Hire with confidence.
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[520px] text-[17px] leading-[1.65] text-[#6B7280]">
            Browse verified professionals, view real work, and find the right person for your next job.
          </p>

          {/* Search */}
          <div className="mt-8 w-full">
            <HeroSearchBar />
          </div>

          {/* Trust indicator */}
          <div className="mt-6 flex items-center gap-3 text-[14px] text-[#6B7280]">
            {proCount > 0 && (
              <>
                <span className="font-semibold text-[#111827]">{proCount}+ local professionals</span>
                <span className="text-[#E5E7EB]">&bull;</span>
              </>
            )}
            <span className="inline-flex items-center gap-1">
              <BadgeCheck size={14} className="text-[#F97316]" />
              Verified reviews
            </span>
            <span className="text-[#E5E7EB]">&bull;</span>
            <span>Free to join</span>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative mx-auto w-full max-w-lg lg:mx-0">
          <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] shadow-[0_4px_20px_rgba(17,24,39,0.06)]">
            <img
              src={heroImage}
              alt="Skilled professionals at work"
              width={900}
              height={675}
              loading="eager"
              className="h-72 w-full object-cover sm:h-[420px]"
            />
          </div>
          {/* Subtle verification card */}
          <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_4px_20px_rgba(17,24,39,0.06)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF7ED] text-[#F97316]">
              <BadgeCheck size={20} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#111827]">Verified Professional</p>
              <p className="text-[12px] text-[#6B7280]">Identity checked &middot; Reviews confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
