import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '../data/landingData';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function TestimonialsSection() {
  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-40 top-1/2 h-[350px] w-[350px] rounded-full bg-gradient-to-r from-orange-200/15 to-amber-200/10 blur-[100px]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-orange-600">Loved locally</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
            The feeling is{' '}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">mutual.</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="relative rounded-3xl border border-gray-200/80 bg-white/60 p-7 shadow-sm backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="absolute right-6 top-6 text-orange-200/50">
                <Quote size={32} />
              </div>
              <div className="flex gap-1 text-orange-400">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="fill-current" size={14} />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-base font-bold leading-7 text-gray-900">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <p className="font-bold text-gray-900">{t.name}</p>
                <p className="mt-0.5 text-gray-500">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
