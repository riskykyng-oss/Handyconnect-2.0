import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeProfessionals } from '@/services/userService';
import StatCounter from './StatCounter';

const PLACEHOLDERS = {
  answered: 250,
  reviews: 190,
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function StatsSection() {
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const unsub = subscribeProfessionals(setPros);
    return unsub;
  }, []);

  const stats = useMemo(() => {
    const totalJobs = pros.reduce((sum, p) => sum + (typeof p.jobs === 'number' ? p.jobs : 0), 0);
    return [
      { key: 'pros', value: pros.length, label: 'Verified professionals' },
      { key: 'jobs', value: totalJobs, label: 'Jobs completed' },
      { key: 'answered', value: PLACEHOLDERS.answered, label: 'Questions answered', placeholder: true },
      { key: 'reviews', value: PLACEHOLDERS.reviews, label: 'Real reviews left', placeholder: true },
    ];
  }, [pros]);

  return (
    <section className="py-14 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-hc-brand">Marketplace stats</p>
          <h2 className="mt-2 font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[32px]">
            A growing community you can count on.
          </h2>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-10 grid grid-cols-2 gap-6 rounded-xl border-[0.5px] border-hc-hairline bg-white px-6 py-10 shadow-sm lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatCounter key={stat.key} value={stat.value} label={stat.label} format={(v) => `${v.toLocaleString()}+`} />
          ))}
        </motion.div>

        <p className="mt-4 text-center text-[13px] text-hc-ink-3">
          Live counts update automatically; a couple of figures are illustrative until the community grows.
        </p>
      </div>
    </section>
  );
}
