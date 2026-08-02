import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { faqs } from '../data/landingData';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="bg-gradient-to-b from-white to-gray-50/80 py-24">
      <div className="mx-auto max-w-3xl px-5">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-orange-600">FAQ</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
            A few{' '}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">good questions.</span>
          </h2>
        </motion.div>

        <motion.div {...fadeUp} className="mt-12 divide-y divide-gray-200 rounded-2xl border border-gray-200/80 bg-white/60 px-6 shadow-sm backdrop-blur-sm">
          {faqs.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-5 py-5 text-left font-bold text-gray-900 transition-colors hover:text-orange-600"
              >
                <span>{item.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="shrink-0 text-orange-500" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 leading-7 text-sm text-gray-600">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
