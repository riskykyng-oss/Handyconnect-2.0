import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { subscribeProfessionals } from '@/services/userService';
import ColoredAvatar from '@/components/ui/ColoredAvatar';
import SearchBar from './SearchBar';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
};

const heroImage =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85';

export default function HeroSection() {
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const unsub = subscribeProfessionals(setPros);
    return unsub;
  }, []);

  return (
    <section className="pb-12 pt-14 lg:pb-20 lg:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        <motion.div {...fadeUp} className="flex flex-col items-start">
          <h1 className="font-display text-[clamp(2.25rem,7vw,3.5rem)] font-medium leading-[1.05] tracking-tight text-hc-ink">
            Find trusted professionals. Hire with confidence.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-hc-ink-2">
            Browse verified pros, see their real work, and book the right person for the job — all in one place.
          </p>

          <div className="mt-8 w-full">
            <SearchBar />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2.5">
              {pros.slice(0, 5).map((p) => (
                <ColoredAvatar key={p.id} id={p.id} name={p.displayName} size="sm" className="border-2 border-white shadow-sm" />
              ))}
            </div>
            <p className="text-[13px] font-medium text-hc-ink-2">
              {pros.length > 0 ? (
                <>{pros.length} local pros ready</>
              ) : (
                <>Local pros ready</>
              )}{' '}
              · <span className="text-hc-ink">Free to join</span> ·{' '}
              <span className="inline-flex items-center gap-1 text-hc-brand">
                <BadgeCheck size={13} /> Verified reviews
              </span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mx-auto w-full max-w-lg lg:py-2"
        >
          <div className="overflow-hidden rounded-[1.5rem] border border-hc-hairline bg-hc-tile">
            <img
              src={heroImage}
              alt="A professional at work in a home"
              width={900}
              height={675}
              loading="lazy"
              className="h-64 w-full object-cover sm:h-[400px]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
