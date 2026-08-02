import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import SearchBar from './SearchBar';

export default function HeroSection() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mx-auto mt-6 mb-8 w-full max-w-[1200px] overflow-hidden rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,.15)] min-h-[280px] md:min-h-[320px] lg:min-h-[360px]"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark Overlay - stronger for text contrast */}
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
          {/* Greeting */}
          <p
            className="font-display font-extrabold leading-[110%] tracking-[-0.03em] text-white text-[28px] md:text-[34px] lg:text-[40px]"
            style={{ marginBottom: '8px' }}
          >
            {greeting}
          </p>

          {/* Subtitle */}
          <p className="font-sans text-base font-medium leading-[170%] text-gray-200 md:text-lg" style={{ marginBottom: '24px' }}>
            Need something fixed? Find trusted pros for everything your home needs.
          </p>

          {/* Search */}
          <div style={{ marginBottom: '24px' }}>
            <SearchBar />
          </div>

          {/* Stats + CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-3">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex w-[140px] items-center gap-3 rounded-[20px] border border-[rgba(255,255,255,.15)] bg-[rgba(255,255,255,.10)] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,.08)] backdrop-blur-[16px]"
              >
                <div>
                  <p className="font-display text-[22px] font-bold leading-none text-white">4,582+</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-orange-200/80">Verified Pros</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex w-[120px] items-center gap-3 rounded-[20px] border border-[rgba(255,255,255,.15)] bg-[rgba(255,255,255,.10)] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,.08)] backdrop-blur-[16px]"
              >
                <div>
                  <p className="font-display text-[22px] font-bold leading-none text-white">12</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-orange-200/80">Jobs Near You</p>
                </div>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/client/explore')}
              className="flex items-center gap-2.5 rounded-2xl bg-orange-500 px-6 py-3 text-[15px] font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/35"
            >
              <Search size={18} /> Find a Pro
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
