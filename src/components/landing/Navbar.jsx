import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Find Services', href: '#categories' },
  { label: 'Professionals', href: '#professionals' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Community', href: '#community' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" aria-label="HandyConnect home">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-sm font-bold text-white">
            HC
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-[#111827]">
            Handy<span className="text-[#F97316]">Connect</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-[15px] font-medium text-[#6B7280] md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#111827]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/auth/login"
            className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
          >
            Log in
          </Link>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F97316] px-5 py-2.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#EA580C]"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F97316] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#EA580C]"
          >
            Get Started
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827]"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#E5E7EB] bg-white md:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-[#6B7280] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827]"
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 border-t border-[#E5E7EB]" />
            <Link
              to="/auth/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-[15px] font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
