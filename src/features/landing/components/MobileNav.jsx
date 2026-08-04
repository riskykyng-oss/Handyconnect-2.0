import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const MOBILE_LINKS = [
  { label: 'Services', id: 'services' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Professionals', id: 'professionals' },
  { label: 'Community', id: 'community' },
  { label: 'FAQ', id: 'faq' },
];

export default function MobileNav({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          id="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden border-t border-hc-hairline bg-white md:hidden"
          aria-label="Mobile menu"
        >
          <div className="flex flex-col gap-1 px-5 py-4">
            {MOBILE_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={onClose}
                className="rounded-lg px-3 py-3 text-base font-medium text-hc-ink transition-colors hover:bg-hc-tile hover:text-hc-brand"
              >
                {item.label}
              </a>
            ))}
            <hr className="my-2 border-hc-hairline" />
            <Link
              to="/auth/login"
              onClick={onClose}
              className="rounded-lg px-3 py-3 text-base font-medium text-hc-ink transition-colors hover:text-hc-brand"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              onClick={onClose}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-hc-brand px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-hc-brand-strong"
            >
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
