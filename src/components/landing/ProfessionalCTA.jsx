import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Star, Users } from 'lucide-react';

export default function ProfessionalCTA() {
  return (
    <section className="bg-[#F8FAFC] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-[#FED7AA] bg-[#FFF7ED] px-8 py-14 sm:px-16 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[32px] font-bold tracking-tight text-[#111827] sm:text-[38px]">
              Are you a skilled professional?
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#6B7280]">
              Showcase your work, connect with clients, and grow your business on HandyConnect.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[15px] text-[#6B7280]">
              <span className="flex items-center gap-2">
                <Briefcase size={18} className="text-[#F97316]" /> Showcase your portfolio
              </span>
              <span className="flex items-center gap-2">
                <Star size={18} className="text-[#F97316]" /> Build real reviews
              </span>
              <span className="flex items-center gap-2">
                <Users size={18} className="text-[#F97316]" /> Connect with clients
              </span>
            </div>

            <Link
              to="/auth/signup"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-7 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#EA580C]"
            >
              Join HandyConnect
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
