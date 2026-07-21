import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register(email, password, name);
      navigate('/auth/select-role');
    } catch (err) {
      setError('Failed to create an account. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Main Curved Container */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700/50">
        
        {/* Left Visual Panel (Dark Grey + Image) */}
        <div className="relative hidden md:block bg-slate-800 h-[680px]">
          <img 
            src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=1528&auto=format&fit=crop" 
            alt="Professional Handyman" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
            <Link to="/" className="font-display font-extrabold text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center text-white text-sm">H</div>
              Handy<span className="text-[#F97316]">Connect</span>
            </Link>
            
            <div>
              <h2 className="font-display font-extrabold text-4xl lg:text-5xl leading-tight mb-6 max-w-md">
                Join the marketplace.
              </h2>
              <p className="text-slate-300 text-lg max-w-sm mb-10">
                Whether you need a job done or you're looking for work, HandyConnect is your trusted partner.
              </p>
              
              <div className="space-y-4">
                {['Identity verified professionals', 'Secure escrow payments', 'Real-time in-app messaging'].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-slate-200">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} className="text-[#F97316]" />
                    </div>
                    <span className="text-base">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel (Dimmed Soft Grey) */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-slate-100 rounded-none md:rounded-r-[2.5rem]">
          <div className="w-full max-w-md">
            <div className="md:hidden mb-10 text-center">
              <Link to="/" className="font-display font-extrabold text-2xl text-gray-900 inline-flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center text-white text-sm">H</div>
                Handy<span className="text-[#F97316]">Connect</span>
              </Link>
            </div>

            <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-2 text-gray-900">Create account</h1>
            <p className="text-gray-500 text-lg mb-10">Get started for free in minutes.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                    className="w-full pl-14 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="w-full pl-14 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    placeholder="Create a secure password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="w-full pl-14 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl text-base transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-orange-500/30 mt-6"
              >
                {loading ? 'Creating account...' : (<>Sign up <ArrowRight size={20} /></>)}
              </button>
            </form>

            <p className="text-center text-base text-gray-500 mt-8">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-[#F97316] font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}