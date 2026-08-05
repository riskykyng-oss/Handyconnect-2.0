import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-hc-hairline bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-8 pb-10 sm:flex-row">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-medium tracking-tight text-hc-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-hc-brand to-hc-brand-strong text-sm font-medium text-white">HC</span>
              Handy<span className="text-hc-brand">Connect</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-hc-ink-2">Better homes start with better connections.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm font-medium text-hc-ink-2">
            <a href="#services" className="transition-colors hover:text-hc-brand">Services</a>
            <a href="#how-it-works" className="transition-colors hover:text-hc-brand">How it works</a>
            <Link to="/auth/login" className="transition-colors hover:text-hc-brand">Log in</Link>
            <Link to="/auth/signup" className="transition-colors hover:text-hc-brand">Get started</Link>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-hc-hairline pt-7 text-xs text-hc-ink-3 sm:flex-row">
          <p>&copy; 2026 HandyConnect. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#privacy" className="transition-colors hover:text-hc-brand">Privacy</a>
            <a href="#terms" className="transition-colors hover:text-hc-brand">Terms</a>
            <a href="#support" className="transition-colors hover:text-hc-brand">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
