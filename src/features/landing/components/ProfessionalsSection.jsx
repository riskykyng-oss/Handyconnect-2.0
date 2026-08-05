import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { subscribeProfessionals } from '@/services/userService';
import ProCard from './ProCard';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function ProfessionalsSection() {
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const unsub = subscribeProfessionals((list) => setPros(list.slice(0, 4)));
    return unsub;
  }, []);

  return (
    <section id="professionals" className="scroll-mt-20 border-t border-hc-hairline py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[32px]">
              Top Rated Professionals
            </h2>
            <p className="mt-3 text-base leading-7 text-hc-ink-2">
              The highest rated pros, trusted by homeowners near you.
            </p>
          </div>
          <Link
            to="/client/explore"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-hc-ink-2 transition-colors hover:text-hc-brand"
          >
            Browse all pros <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {pros.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-hc-hairline bg-white p-10 text-center">
            <Users size={26} className="mx-auto text-hc-ink-3" />
            <p className="mt-3 text-base font-medium text-hc-ink">No professionals yet</p>
            <p className="mx-auto mt-1 max-w-md text-[13px] text-hc-ink-3">
              When professionals join HandyConnect and start building their public profiles, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {pros.map((pro, i) => (
              <motion.div
                key={pro.id || i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <ProCard pro={pro} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
