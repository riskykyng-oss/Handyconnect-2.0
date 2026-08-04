import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck, Star, MessageSquare, MapPin, Users } from 'lucide-react';
import { trustBadges } from '../data/landingData';

const ICONS = {
  'Verified professionals': BadgeCheck,
  'Secure payments': ShieldCheck,
  'Real reviews': Star,
  'Live chat': MessageSquare,
  'Location verified': MapPin,
  'Community moderated': Users,
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

export default function TrustBadges() {
  return (
    <section className="border-y border-hc-hairline bg-white py-10 lg:py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-5 sm:grid-cols-3 lg:grid-cols-6 lg:px-8">
        {trustBadges.map((badge, i) => {
          const Icon = ICONS[badge.label] || BadgeCheck;
          return (
            <motion.div
              key={badge.label}
              {...fadeUp}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-hc-tile text-hc-brand">
                <Icon size={22} />
              </span>
              <p className="text-sm font-medium text-hc-ink">{badge.label}</p>
              <p className="max-w-[160px] text-[13px] leading-5 text-hc-ink-3">{badge.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
