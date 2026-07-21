import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, ArrowLeft, MailCheck, Star } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError("Couldn't send a reset link. Check the email and try again.");
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
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1528&auto=format&fit=crop" 
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
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold text-[#F97316] mb-6">
                <Star size={12} className="fill-[#F97316] text-[#F97316]" /> Trusted by 10,000+ users
              </div>
              <h2 className="font-display font-extrabold text-4xl lg:text-5xl leading-tight mb-4 max-w-md">
                Locked out? Happens to everyone.
              </h2>
              <p className="text-slate-300 text-lg max-w-sm">
                Pop in the email on your account and we'll send a link to get you straight back in.
              </p>
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

            {!sent ? (
              <>
                <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-2 text-gray-900">Reset your password</h1>
                <p className="text-gray-500 text-lg mb-10">Enter the email address linked to your account.</p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl text-base transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-orange-500/30 mt-6"
                  >
                    {loading ? 'Sending link...' : (<>Send reset link <ArrowRight size={20} /></>)}
                  </button>
                </form>
              </>
            ) : (
              <div>
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <MailCheck className="text-[#F97316]" size={26} />
                </div>
                <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-2 text-gray-900">Check your inbox</h1>
                <p className="text-gray-500 text-lg mb-2">
                  We've sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>.
                </p>
                <p className="text-gray-400 text-sm mb-8">Didn't get it? Check spam, or try again in a couple of minutes.</p>
                <button 
                  onClick={() => setSent(false)} 
                  className="text-sm text-[#F97316] font-bold hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}

            <Link to="/auth/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mt-10 font-medium transition-colors">
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}