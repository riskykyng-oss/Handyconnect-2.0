import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MobileNav from './MobileNav';

const DESKTOP_LINKS = [
  { label: 'Services', id: 'services' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Professionals', id: 'professionals' },
  { label: 'Community', id: 'community' },
  { label: 'FAQ', id: 'faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hc-hairline bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-medium tracking-tight text-hc-ink" aria-label="HandyConnect home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hc-brand text-sm font-medium text-white">HC</span>
          Handy<span className="text-hc-brand">Connect</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-hc-ink-2 md:flex" aria-label="Primary">
          {DESKTOP_LINKS.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="transition-colors hover:text-hc-brand">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/auth/login" className="rounded-full px-4 py-2 text-sm font-medium text-hc-ink-2 transition-colors hover:text-hc-ink">
            Log in
          </Link>
          <Link to="/auth/signup" className="inline-flex items-center rounded-full bg-hc-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-hc-brand-strong">
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/auth/signup"
            className="inline-flex items-center rounded-full bg-hc-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-hc-brand-strong"
          >
            Get started
          </Link>
          <button
            className="rounded-lg p-2 text-hc-ink-2 transition-colors hover:bg-hc-tile hover:text-hc-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <MobileNav open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
