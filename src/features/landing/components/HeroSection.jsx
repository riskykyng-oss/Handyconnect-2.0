import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, BadgeCheck, Heart } from 'lucide-react';
import { subscribeProfessionals } from '@/services/userService';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

function Avatar({ pro }) {
  if (pro.photoURL) {
    return <img className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm" src={pro.photoURL} alt="" />;
  }
  return (
    <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-orange-100 text-xs font-bold text-orange-600 shadow-sm">
      {(pro.displayName || 'P').charAt(0).toUpperCase()}
    </div>
  );
}

export default function HeroSection() {
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const unsub = subscribeProfessionals(setPros);
    return unsub;
  }, []);

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-20 lg:pb-24 lg:pt-32">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-orange-300/30 to-rose-300/15 blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-300/25 to-indigo-300/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/4 h-[350px] w-[350px] rounded-full bg-gradient-to-r from-amber-200/20 to-orange-200/15 blur-[100px]"
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <motion.div {...fadeUp} className="flex flex-col items-start justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200/60 bg-white/80 px-4 py-1.5 text-xs font-semibold text-orange-700 shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
             Local homeowners &amp; pros, one community
          </motion.div>
          <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] text-gray-900 sm:text-6xl lg:text-7xl">
            Where your home{' '}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">meets</span>{' '}
            its community.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-500">
            Follow trusted professionals, see their work, and hire with confidence. A social marketplace for everything your home needs.
          </p>

          {/* Glass search bar */}
          <div className="mt-8 w-full max-w-2xl rounded-2xl border border-white/50 bg-white/80 p-1.5 shadow-xl shadow-gray-900/5 backdrop-blur-xl sm:flex sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-4 py-3">
              <Search className="text-orange-500" size={19} />
              <input
                aria-label="Service needed"
                placeholder="Find a pro, service, or community..."
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="mx-2 hidden h-7 w-px bg-gray-200 sm:block" />
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <MapPin size={17} className="text-orange-500" /> Harare
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-orange-500 sm:mt-0 sm:w-auto"
            >
              Search <ArrowRight size={16} />
            </motion.button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-3">
              {pros.slice(0, 5).map((p, i) => (
                <motion.div
                  key={p.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Avatar pro={p} />
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {pros.length > 0 ? (
                <>
                  <span className="font-bold text-gray-900">{pros.length}</span> local {pros.length === 1 ? 'pro' : 'pros'} ready to help &bull;{' '}
                  <span className="font-medium text-orange-500">Join the community</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">Real pros</span>, verified &amp; reviewed &bull;{' '}
                  <span className="font-medium text-orange-500">Join the community</span>
                </>
              )}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mx-auto w-full max-w-lg py-6 lg:py-0"
        >
          {/* Floating decorative cards */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.3 }}
            className="absolute -left-10 top-20 z-10 hidden rounded-2xl border border-white/50 bg-white/80 p-3.5 shadow-xl backdrop-blur-xl sm:block"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 p-2 text-orange-600 shadow-sm">
                <Heart size={18} className="fill-current" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Follow pros</p>
                <p className="text-xs text-gray-500">See their work in your feed</p>
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-orange-300/40 to-rose-300/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-white shadow-2xl shadow-orange-500/5">
            <img
              className="h-[440px] w-full rounded-[2rem] object-cover"
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85"
              alt="Professional at work"
            />
            <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/50 bg-white/80 p-4 text-gray-900 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600">
                    <BadgeCheck size={12} className="fill-current" /> Verified professionals
                  </div>
                  <p className="mt-1 font-display font-bold">Reviewed &amp; rated</p>
                  <p className="text-xs text-gray-500">Public work history you can trust</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 text-white shadow-lg shadow-orange-500/20">
                  <BadgeCheck size={22} />
                </div>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.6 }}
            className="absolute -bottom-2 -right-8 z-10 hidden rounded-2xl border border-white/50 bg-white/80 p-3.5 shadow-xl backdrop-blur-xl sm:block"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 p-2 text-emerald-600 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-[18px] w-[18px]"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Job complete</p>
                <p className="text-xs text-gray-500">Paid securely &amp; reviewed</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
