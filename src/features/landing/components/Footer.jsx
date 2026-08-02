import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-8 pb-10 sm:flex-row">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm text-white shadow-md">HC</span>
              Handy<span className="text-orange-500">Connect</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-gray-500">Better homes start with better connections.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm font-medium text-gray-500">
            <a href="#services" className="transition-colors hover:text-orange-500">Services</a>
            <a href="#how-it-works" className="transition-colors hover:text-orange-500">How it works</a>
            <Link to="/auth/login" className="transition-colors hover:text-orange-500">Log in</Link>
            <Link to="/auth/signup" className="transition-colors hover:text-orange-500">Get started</Link>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-gray-200 pt-7 text-xs text-gray-400 sm:flex-row">
          <p>&copy; 2026 HandyConnect. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#privacy" className="transition-colors hover:text-orange-500">Privacy</a>
            <a href="#terms" className="transition-colors hover:text-orange-500">Terms</a>
            <a href="#support" className="transition-colors hover:text-orange-500">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
