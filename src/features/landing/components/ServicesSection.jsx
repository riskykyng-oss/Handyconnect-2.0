import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { categories } from '../data/landingData';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function ServicesSection() {
  return (
    <section id="services" className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <motion.div {...fadeUp} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-orange-600">Explore services</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
            Everyday help. <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Exceptionally</span> easy.
          </h2>
        </div>
        <Link to="/auth/signup" className="group inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition-colors hover:text-orange-500">
          Browse all services <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="group cursor-pointer rounded-3xl border border-gray-200/80 bg-white/60 p-6 shadow-sm transition-all backdrop-blur-sm hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} shadow-lg shadow-${cat.gradient.split(' ')[0].replace('from-', '')}/20`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-gray-900">{cat.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{cat.desc}</p>
              <div className="mt-5 flex items-center gap-1 text-sm font-medium text-orange-500 opacity-0 transition-all group-hover:opacity-100">
                Find a pro <ArrowRight size={14} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
