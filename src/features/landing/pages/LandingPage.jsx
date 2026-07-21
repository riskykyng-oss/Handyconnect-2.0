import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import {
  Star, ShieldCheck, Search, ArrowRight, Wrench, Zap, ClipboardList,
  Wallet, Users, Paintbrush, CheckCircle2, Menu, X,
  MapPin, Hammer, Sparkles, Truck
} from 'lucide-react';

/*
  DESIGN NOTES
  -------------------------------------------------------------
  Direction: light, rounded, friendly consumer-marketplace (TaskRabbit-adjacent)
  
  Palette
    ink      #111827  -- near-black, used for headlines
    paper    #FFFFFF  -- primary background
    cloud    #F8FAFC  -- slate-50 for section breaks
    primary  #F97316  -- orange-500, friendly confident orange
    slate    #6B7280  -- gray-500 for body copy
*/

const useScrollFadeIn = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);
  return visible;
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fadeIn = useScrollFadeIn();

  const categories = [
    { name: 'Plumbing', icon: Wrench, bg: 'bg-blue-50', fg: 'text-blue-600' },
    { name: 'Electrical', icon: Zap, bg: 'bg-amber-50', fg: 'text-amber-600' },
    { name: 'Cleaning', icon: Sparkles, bg: 'bg-purple-50', fg: 'text-purple-600' },
    { name: 'Carpentry', icon: Hammer, bg: 'bg-indigo-50', fg: 'text-indigo-600' },
    { name: 'Painting', icon: Paintbrush, bg: 'bg-pink-50', fg: 'text-pink-600' },
    { name: 'Moving', icon: Truck, bg: 'bg-teal-50', fg: 'text-teal-600' },
  ];

  const steps = [
    {
      title: 'Post the job',
      body: "Describe what needs doing. It's free to post, and takes under two minutes.",
      icon: ClipboardList,
    },
    {
      title: 'Compare quotes',
      body: 'Verified pros near you send quotes. Check ratings and past work before you choose.',
      icon: Search,
    },
    {
      title: 'Get it done',
      body: "Chat in-app, track progress, and pay securely once you're happy with the job.",
      icon: Wrench,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#111827] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-display font-extrabold text-xl">
            Handy<span className="text-[#F97316]">Connect</span>
          </span>

          <nav className="hidden lg:flex items-center gap-9 text-sm font-medium text-gray-500">
            <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#services" className="hover:text-gray-900 transition-colors">Services</a>
            <a href="#why" className="hover:text-gray-900 transition-colors">Why us</a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/auth/login" className="text-gray-900 hover:text-[#F97316] text-sm font-semibold">
              Login
            </Link>
            <Link to="/auth/signup">
              <Button className="px-6 py-2.5 text-sm rounded-full bg-[#F97316] hover:bg-orange-600 text-white border-0 font-semibold">
                Get started
              </Button>
            </Link>
          </div>

          <button className="lg:hidden text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700">
            <a href="#how">How it works</a>
            <a href="#services">Services</a>
            <a href="#why">Why us</a>
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/signup">
              <Button className="w-full rounded-full bg-[#F97316] hover:bg-orange-600 text-white border-0">Get started</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative bg-slate-50 overflow-hidden">
        <div className={`max-w-7xl mx-auto px-6 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Left content */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-semibold text-[#F97316] mb-6 shadow-sm">
              <Star size={12} className="fill-[#F97316] text-[#F97316]" /> Zimbabwe's #1 handyman marketplace
            </div>

            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-[1.08] mb-6 max-w-xl">
              Help around the house, right when you need it.
            </h1>

            <p className="text-lg text-gray-500 mb-8 max-w-md">
              Post a job, get quotes from verified pros nearby, and book the right person in minutes.
            </p>

            {/* Search bar */}
            <div className="w-full max-w-xl bg-white rounded-full p-2 flex flex-col sm:flex-row items-center gap-2 mb-8 shadow-md">
              <div className="flex-1 flex items-center gap-3 pl-4 pr-2 py-2 w-full">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="What do you need help with?"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
              <div className="hidden sm:block h-6 w-px bg-slate-200" />
              <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                <MapPin size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Harare"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
              <Button className="w-full sm:w-auto px-7 py-2.5 rounded-full text-sm bg-[#F97316] hover:bg-orange-600 text-white border-0 font-semibold">
                Search
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-xs">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Trusted by <span className="font-bold text-gray-900">10,000+</span> Zimbabweans
              </p>
            </div>
          </div>

          {/* Right image - Reduced size here */}
          <div className="relative hidden md:block">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop"
                alt="Professional handyman at work"
                className="w-full h-[440px] object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
                <CheckCircle2 className="text-[#F97316]" size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-sm">Verified pro</p>
                <p className="text-xs text-gray-400">ID & background checked</p>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
                <Star size={20} className="text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">4.9 rating</p>
                <p className="text-xs text-gray-400">2,500+ reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-slate-200 bg-white/60">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">10K+</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Happy clients</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">5K+</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Verified pros</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">98%</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Satisfaction rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest text-[#F97316] uppercase mb-3">What we cover</p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-3 text-gray-900">Popular services</h2>
          <p className="text-gray-500">Verified pros ready to help, in every category.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md hover:border-orange-300 transition-all duration-300 cursor-pointer group"
            >
              <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <cat.icon className={cat.fg} size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">View pros nearby</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-[#F97316] group-hover:translate-x-1 transition-all ml-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-[#F97316] uppercase mb-3">Simple by design</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900">Three steps, no back and forth</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.title} className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="text-[#F97316]" size={24} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="why" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#F97316] uppercase mb-3">Built on trust</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-6 text-gray-900">Why choose HandyConnect?</h2>
            <p className="text-gray-500 mb-10 text-lg">
              We're not a directory of phone numbers. Every job is backed by identity checks, secure payment
              holding, and reviews that can't be gamed.
            </p>

            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: 'Trust & safety', body: 'Every professional is identity-checked and rated by real clients.' },
                { icon: Wallet, title: 'Secure payments', body: 'Funds are held safely and released only once the job is done.' },
                { icon: Users, title: 'Community driven', body: 'Read honest reviews and build long-term relationships with pros you trust.' },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon className="text-[#F97316]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base mb-1 text-gray-900">{title}</h4>
                    <p className="text-gray-500 text-sm">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-12 text-white">
            <div className="grid grid-cols-2 gap-8 text-left">
              <div>
                <p className="font-display font-extrabold text-4xl mb-1 text-[#F97316]">10K+</p>
                <p className="text-sm text-gray-400">Happy clients</p>
              </div>
              <div>
                <p className="font-display font-extrabold text-4xl mb-1 text-[#F97316]">5K+</p>
                <p className="text-sm text-gray-400">Verified pros</p>
              </div>
              <div>
                <p className="font-display font-extrabold text-4xl mb-1 text-[#F97316]">98%</p>
                <p className="text-sm text-gray-400">Satisfaction rate</p>
              </div>
              <div>
                <p className="font-display font-extrabold text-4xl mb-1 text-[#F97316]">24/7</p>
                <p className="text-sm text-gray-400">Support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-10 pt-8 border-t border-white/10 text-sm text-gray-300">
              <CheckCircle2 size={16} className="text-[#F97316]" /> Background checks run on every professional before approval
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-6 text-gray-900">Ready to get started?</h2>
        <p className="text-lg text-gray-500 mb-10">Join thousands of happy clients and professional handymen today.</p>
        <Link to="/auth/signup">
          <Button size="lg" className="px-10 py-4 text-base rounded-full bg-[#F97316] hover:bg-orange-600 text-white border-0 font-semibold shadow-md hover:shadow-lg transition-shadow">
            Create free account <ArrowRight size={20} className="ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-display font-extrabold text-xl text-gray-900">
            Handy<span className="text-[#F97316]">Connect</span>
          </span>
          <p className="text-sm text-gray-400">© 2026 HandyConnect. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}