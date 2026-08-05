import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { testimonials } from '../data/landingData';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function TestimonialsSection() {
  return (
    <section className="border-t border-hc-hairline bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[32px]">
            Hear from homeowners.
          </h2>
          <p className="mt-3 text-base leading-7 text-hc-ink-2">
            Real words from people who used HandyConnect.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="rounded-xl border border-hc-hairline bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex gap-1 text-hc-brand">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="fill-current" size={14} />
                ))}
              </div>
              <blockquote className="mt-4 text-base font-medium leading-7 text-hc-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-hc-hairline pt-4 text-sm">
                <p className="font-medium text-hc-ink">{t.name}</p>
                <p className="mt-0.5 text-hc-ink-2">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
