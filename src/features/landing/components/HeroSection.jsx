import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, BadgeCheck } from 'lucide-react';
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
    <section className="relative isolate overflow-hidden pb-14 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full bg-hc-brand/10 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full bg-hc-tint blur-[120px]"
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:pt-24">
        <motion.div {...fadeUp} className="flex flex-col items-start">
          <p className="inline-flex items-center gap-2 rounded-full border-[0.5px] border-hc-hairline bg-white/80 px-4 py-1.5 text-[13px] font-medium text-hc-tint-text shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hc-brand opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-hc-brand" />
            </span>
            Local homeowners &amp; pros, one community
          </p>

          <h1 className="mt-6 font-display text-[clamp(2.25rem,7vw,3.5rem)] font-medium leading-[1.05] tracking-tight text-hc-ink">
            Where your home <span className="text-hc-brand">meets</span> its community.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-hc-ink-2">
            Follow trusted professionals, see their work, and hire with confidence. A social marketplace for everything your home needs.
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
              &bull; <span className="text-hc-ink">Free to join</span> &bull;{' '}
              <span className="inline-flex items-center gap-1 text-hc-brand">
                <BadgeCheck size={13} /> Verified reviews
              </span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mx-auto w-full max-w-lg lg:py-2"
        >
          <div className="absolute inset-6 rounded-[2rem] bg-hc-brand/10 blur-2xl" />

          <div className="relative overflow-hidden rounded-[1.5rem] border-[0.5px] border-hc-hairline bg-white shadow-2xl shadow-hc-ink/10">
            <img
              src={heroImage}
              alt="A professional at work in a home"
              width={900}
              height={675}
              loading="lazy"
              className="h-[360px] w-full object-cover sm:h-[440px]"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-xl border-[0.5px] border-hc-hairline bg-white/90 p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-hc-brand">
                    <BadgeCheck size={14} /> Verified professionals
                  </p>
                  <p className="mt-0.5 text-base font-medium text-hc-ink">Reviewed &amp; rated</p>
                  <p className="text-[13px] text-hc-ink-3">Public work history you can trust</p>
                </div>
                <span className="hidden rounded-xl bg-hc-tile p-3 text-hc-brand sm:block">
                  <BadgeCheck size={22} />
                </span>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.3 }}
            className="absolute -left-4 top-16 z-10 hidden rounded-xl border-[0.5px] border-hc-hairline bg-white/90 p-3.5 shadow-xl backdrop-blur-md sm:block lg:-left-10"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-hc-tile p-2 text-hc-brand">
                <Heart size={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-hc-ink">Follow pros</p>
                <p className="text-[13px] text-hc-ink-3">See their work in your feed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.6 }}
            className="absolute -right-4 top-1/2 z-10 hidden rounded-xl border-[0.5px] border-hc-hairline bg-white/90 p-3.5 shadow-xl backdrop-blur-md sm:block lg:-right-10"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-hc-tile p-2 text-hc-brand">
                <BadgeCheck size={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-hc-ink">Job complete</p>
                <p className="text-[13px] text-hc-ink-3">Paid securely &amp; reviewed</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
