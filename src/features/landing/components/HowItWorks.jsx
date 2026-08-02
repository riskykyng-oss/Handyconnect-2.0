import { motion } from 'framer-motion';
import { steps } from '../data/landingData';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gradient-to-b from-gray-50/80 to-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-orange-600">How it works</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
            Marketplace + social.{' '}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">One platform.</span>
          </h2>
          <p className="mt-4 text-gray-500">
            Post a job, follow pros you love, and share your projects with the community.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative rounded-3xl border border-gray-200/80 bg-white/60 p-8 shadow-sm transition-all backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                <p className="font-display text-6xl font-bold bg-gradient-to-b from-orange-200 to-orange-100 bg-clip-text text-transparent">{step.num}</p>
                <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/20">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 leading-7 text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
