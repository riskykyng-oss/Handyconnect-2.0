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
    <section id="faq" className="scroll-mt-20 border-t border-hc-hairline py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-5">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[32px]">
            Good questions, clear answers.
          </h2>
          <p className="mt-3 text-base leading-7 text-hc-ink-2">
            Everything you need to know before you hire.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-8 divide-y divide-hc-hairline rounded-xl border border-hc-hairline bg-white px-6 sm:mt-10">
          {faqs.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-5 py-5 text-left font-medium text-hc-ink transition-colors hover:text-hc-brand"
              >
                <span>{item.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="shrink-0 text-hc-brand" />
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
                    <p className="pb-5 text-sm leading-7 text-hc-ink-2">{item.a}</p>
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
