import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeProfessionals } from '@/services/userService';
import { categories } from '../data/landingData';
import ServiceCard from './ServiceCard';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

const matchTrade = (pro, name) => {
  const trade = `${pro.trade || ''} ${pro.skills || ''}`.toLowerCase();
  return trade.includes(name.toLowerCase());
};

export default function ServicesSection() {
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const unsub = subscribeProfessionals(setPros);
    return unsub;
  }, []);

  const stats = useMemo(() => {
    return categories.map((cat) => {
      const matched = pros.filter((pro) => matchTrade(pro, cat.name));
      const rates = matched.filter((p) => typeof p.hourlyRate === 'number').map((p) => p.hourlyRate);
      const ratings = matched.filter((p) => typeof p.rating === 'number').map((p) => p.rating);
      return {
        name: cat.name,
        count: matched.length,
        fromPrice: rates.length ? Math.min(...rates) : null,
        rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
      };
    });
  }, [pros]);

  return (
    <section id="services" className="scroll-mt-20 border-t border-hc-hairline py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="max-w-2xl">
          <h2 className="font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[32px]">
            Popular Categories
          </h2>
          <p className="mt-3 text-base leading-7 text-hc-ink-2">
            Browse by trade and find the right help for every job.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <ServiceCard service={cat} {...stats.find((s) => s.name === cat.name)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
