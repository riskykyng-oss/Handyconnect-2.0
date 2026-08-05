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
    <section id="how-it-works" className="scroll-mt-20 border-t border-hc-hairline bg-hc-page py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[32px]">
            How HandyConnect Works
          </h2>
          <p className="mt-3 text-base leading-7 text-hc-ink-2">
            From find to review in five simple steps.
          </p>
        </motion.div>

        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="rounded-xl border border-hc-hairline bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-hc-tile text-hc-brand">
                    <Icon size={20} />
                  </span>
                  <span className="font-display text-[13px] font-medium text-hc-ink-3">{step.num}</span>
                </div>
                <h3 className="mt-4 text-[18px] font-medium text-hc-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-hc-ink-2">{step.desc}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
