import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 px-8 py-16 text-center shadow-2xl shadow-orange-500/30 sm:px-16 sm:py-20"
        >
          {/* Animated orbs */}
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-24 -right-8 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-rose-300/15 blur-2xl"
          />

          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl">
              The right person for the job is{' '}
              <span className="text-orange-200">waiting.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-orange-100">
              Join the easier way to care for your home.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-9 inline-block"
            >
              <Link
                to="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-orange-600 shadow-xl transition-all hover:bg-orange-50 hover:shadow-2xl"
              >
                Create your free account <ArrowRight size={18} />
              </Link>
            </motion.div>
            <p className="mt-5 text-xs text-orange-200/80">No credit card required. Free to join.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
