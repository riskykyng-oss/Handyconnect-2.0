import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = ['Services', 'How it works', 'Professionals', 'FAQ'];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkId = (label) => `#${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm text-white shadow-md">HC</span>
          Handy<span className="text-orange-500">Connect</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          {navLinks.map((item) => (
            <a key={item} href={linkId(item)} className="transition-colors hover:text-orange-500">
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/auth/login" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900">
            Log in
          </Link>
          <Link to="/auth/signup">
            <button className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-400">
              Get started <ArrowRight size={15} />
            </button>
          </Link>
        </div>

        <button className="p-2 text-gray-500 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200 bg-white px-5 py-5 md:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm font-semibold text-gray-700">
            {navLinks.map((item) => (
              <a key={item} href={linkId(item)} onClick={() => setOpen(false)} className="transition-colors hover:text-orange-500">
                {item}
              </a>
            ))}
            <hr className="border-gray-200" />
            <Link to="/auth/login" onClick={() => setOpen(false)}>Log in</Link>
            <Link to="/auth/signup" onClick={() => setOpen(false)}>
              <button className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-md">
                Get started
              </button>
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
