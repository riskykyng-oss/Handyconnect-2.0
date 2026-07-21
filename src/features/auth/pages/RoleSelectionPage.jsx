import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Wrench, ArrowRight, Loader2 } from 'lucide-react';

export default function RoleSelectionPage() {
  const { assignRole, userRole } = useAuth(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // If they already have a role, redirect them automatically!
  useEffect(() => {
    if (userRole === 'client') navigate('/client/home', { replace: true });
    if (userRole === 'handyman') navigate('/handyman/jobs', { replace: true });
    if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
  }, [userRole, navigate]);

  const handleSelectRole = async (role) => {
    setLoading(true);
    try {
      await assignRole(role);
      
      // Redirect based on role
      if (role === 'client') navigate('/client/home');
      if (role === 'handyman') navigate('/handyman/jobs');
    } catch (error) {
      console.error("Error setting role:", error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-white overflow-hidden bg-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Blurred Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2070&auto=format&fit=crop" 
          alt="Tools background" 
          className="w-full h-full object-cover blur-md scale-105 opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-black/90"></div>
      </div>

      {/* Glassmorphism Card Container */}
      <div className="relative z-10 w-full max-w-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12">
        
        <div className="flex flex-col items-center text-center mb-10">
          <Link to="/" className="font-display font-extrabold text-2xl mb-6 inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center text-white text-sm">H</div>
            Handy<span className="text-[#F97316]">Connect</span>
          </Link>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-3">Choose Your Path</h1>
          <p className="text-slate-400 text-lg">How do you want to use HandyConnect?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Role */}
          <button 
            onClick={() => handleSelectRole('client')}
            disabled={loading}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F97316]/50 rounded-2xl p-8 text-left transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#F97316] group-hover:border-[#F97316] transition-colors">
              <User className="text-[#F97316] group-hover:text-white transition-colors" size={28} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">I'm a Client</h3>
            <p className="text-slate-400 text-sm">I need to find trusted handymen for my projects.</p>
            <ArrowRight className="absolute bottom-8 right-8 text-slate-600 group-hover:text-[#F97316] group-hover:translate-x-1 transition-all" size={20} />
          </button>

          {/* Handyman Role */}
          <button 
            onClick={() => handleSelectRole('handyman')}
            disabled={loading}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F97316]/50 rounded-2xl p-8 text-left transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#F97316] group-hover:border-[#F97316] transition-colors">
              <Wrench className="text-[#F97316] group-hover:text-white transition-colors" size={28} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-white">I'm a Handyman</h3>
            <p className="text-slate-400 text-sm">I want to offer my services and find work.</p>
            <ArrowRight className="absolute bottom-8 right-8 text-slate-600 group-hover:text-[#F97316] group-hover:translate-x-1 transition-all" size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center mt-8 text-slate-400 text-sm">
            <Loader2 size={18} className="animate-spin mr-2" /> Setting up your account...
          </div>
        )}
      </div>
    </div>
  );
}