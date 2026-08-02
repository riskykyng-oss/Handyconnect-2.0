import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, Users } from 'lucide-react';
import { subscribeProfessionals } from '@/services/userService';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

function ProAvatar({ pro }) {
  if (pro.photoURL) {
    return <img className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" src={pro.photoURL} alt={pro.displayName || 'Professional'} />;
  }
  return (
    <div className="grid h-56 w-full place-items-center bg-gradient-to-br from-orange-100 to-rose-100 text-4xl font-extrabold text-orange-500 transition-transform duration-500 group-hover:scale-105">
      {(pro.displayName || 'P').charAt(0).toUpperCase()}
    </div>
  );
}

export default function ProfessionalsSection() {
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const unsub = subscribeProfessionals((list) => setPros(list.slice(0, 6)));
    return unsub;
  }, []);

  return (
    <section id="professionals" className="bg-gradient-to-t from-gray-50/80 to-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-orange-600">Meet the community</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
            The pros people{' '}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">follow and trust.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Skilled people, properly verified, building their reputation one job at a time. Follow your favorites and never search twice.
          </p>
        </motion.div>

        {pros.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-white/40 p-10 text-center backdrop-blur-sm">
            <Users size={28} className="mx-auto text-gray-300" />
            <p className="mt-3 font-display text-lg font-bold text-gray-900">No professionals yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              When professionals join HandyConnect and start building their public profiles, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pros.map((pro, i) => (
              <motion.article
                key={pro.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="group overflow-hidden rounded-3xl border border-gray-200/80 bg-white/60 shadow-sm transition-all backdrop-blur-sm hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/5"
              >
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  <ProAvatar pro={pro} />
                  {typeof pro.rating === 'number' && (
                    <div className="absolute right-3 top-3 z-20 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-bold text-orange-600 shadow-sm backdrop-blur-sm">
                      <Star className="inline fill-current" size={11} /> {pro.rating}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-gray-900">
                        {pro.displayName || 'Handyman'} {pro.verified && <BadgeCheck className="inline text-orange-500" size={16} />}
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-500">{pro.trade || (pro.skills && pro.skills.split(',')[0]) || 'Professional'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                    {typeof pro.jobs === 'number' ? (
                      <span>{pro.jobs} jobs</span>
                    ) : (
                      <span>New to HandyConnect</span>
                    )}
                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Available
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
