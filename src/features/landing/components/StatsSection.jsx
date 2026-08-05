import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeProfessionals } from '@/services/userService';
import StatCounter from './StatCounter';

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
    const rated = pros.filter((p) => typeof p.rating === 'number' && p.rating > 0);
    const jobs = pros.reduce((sum, p) => sum + (typeof p.jobs === 'number' ? p.jobs : 0), 0);
    const verified = pros.filter((p) => p.verified === true).length;
    return {
      rating: rated.length ? rated.reduce((a, b) => a + b.rating, 0) / rated.length : 0,
      jobs,
      pros: verified,
    };
  }, [pros]);

  if (!pros.length) return null;

  const hasRating = stats.rating > 0;

  return (
    <section className="border-t border-hc-hairline py-12 sm:py-16 lg:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-y-10 sm:flex-row sm:justify-center sm:gap-16 lg:gap-24">
        {hasRating && (
          <motion.div {...fadeUp}>
            <StatCounter value={stats.rating} format={(v) => `${v.toFixed(1)} ★`} label="Average rating" />
          </motion.div>
        )}
        <motion.div {...fadeUp} transition={{ delay: 0.08, duration: 0.5 }}>
          <StatCounter value={stats.jobs} format={(v) => `${v.toLocaleString()}+`} label="Jobs completed" />
        </motion.div>
        <motion.div {...fadeUp} transition={{ delay: 0.16, duration: 0.5 }}>
          <StatCounter value={stats.pros} format={(v) => `${v.toLocaleString()}+`} label="Verified professionals" />
        </motion.div>
      </div>
    </section>
  );
}
