import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Star, MapPin } from 'lucide-react';

export default function HandymanHero({ name, available, onToggle }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mt-6 mb-8 min-h-[280px] w-full overflow-hidden rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,.15)] md:min-h-[320px] lg:min-h-[360px]"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1400&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/20" />

      {/* Orange Accent Blobs */}
      <motion.div
        animate={{ x: [0, 8, 0], y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full bg-orange-500 opacity-[0.20] blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -8, 0], y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-16 -left-8 h-[160px] w-[160px] rounded-full bg-orange-400 opacity-[0.15] blur-[90px]"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-6 md:px-8 lg:px-10">
        <div className="w-full max-w-xl">
          <p
            className="font-display font-extrabold leading-[110%] tracking-[-0.03em] text-white text-[28px] md:text-[34px] lg:text-[40px]"
            style={{ marginBottom: '8px' }}
          >
            {greeting}, {name}
          </p>

          <p className="font-sans text-base font-medium leading-[170%] text-gray-200 md:text-lg" style={{ marginBottom: '24px' }}>
            New jobs land in your area every day. Turn your availability on to get matched.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onToggle}
              className={`flex items-center gap-2.5 rounded-2xl px-6 py-3 text-[15px] font-bold text-white shadow-lg transition-all ${
                available
                  ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/35'
                  : 'border border-white/30 bg-white/15 backdrop-blur-[16px] hover:bg-white/25'
              }`}
            >
              {available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {available ? 'Available for work' : 'Go online'}
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex w-[140px] items-center gap-3 rounded-[20px] border border-[rgba(255,255,255,.15)] bg-[rgba(255,255,255,.10)] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,.08)] backdrop-blur-[16px]"
            >
              <div>
                <p className="font-display text-[22px] font-bold leading-none text-white">New</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-orange-200/80">
                  <Star size={10} /> Rating
                </p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex w-[140px] items-center gap-3 rounded-[20px] border border-[rgba(255,255,255,.15)] bg-[rgba(255,255,255,.10)] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,.08)] backdrop-blur-[16px]"
            >
              <div>
                <p className="font-display text-[22px] font-bold leading-none text-white">12</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-orange-200/80">
                  <MapPin size={10} /> Jobs Near You
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
