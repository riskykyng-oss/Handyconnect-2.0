import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, MapPin, Star, Loader2, Briefcase,
  MessageCircle, Zap, Phone, Clock, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getPublicPro, subscribePortfolio } from '@/services/portfolioService';
import { subscribeToHandymanReviews } from '@/services/reviewService';
import PortfolioCard from '@/features/portfolio/components/PortfolioCard';
import HireProModal from '@/features/client/components/HireProModal';

function Stars({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= Math.round(value || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  );
}

export default function ProPortfolioPage() {
  const { proId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const [pro, setPro] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hireOpen, setHireOpen] = useState(false);
  const [hireMode, setHireMode] = useState('hire');

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await getPublicPro(proId);
      if (active) setPro(data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [proId]);

  useEffect(() => {
    if (!proId) return undefined;
    const unsubscribe = subscribePortfolio(proId, setItems);
    return unsubscribe;
  }, [proId]);

  useEffect(() => {
    if (!proId) return undefined;
    return subscribeToHandymanReviews(proId, setReviews);
  }, [proId]);

  const isOwn = pro?.id === currentUser?.uid;
  const firstName = pro?.name?.split(' ')[0] || '';
  const skills = pro?.skills ? pro.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : pro?.rating != null ? Number(pro.rating).toFixed(1) : null;

  const openHire = (mode) => {
    if (userRole !== 'client') return;
    setHireMode(mode);
    setHireOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-hc-ink-3" size={28} /></div>;
  }

  if (!pro) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-xl font-semibold tracking-tight text-hc-ink">Professional not found</p>
        <p className="mt-1 text-sm text-hc-caption">This profile may have been removed.</p>
        <Link to="/community" className="mt-4 inline-block rounded-xl bg-hc-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong">
          Back to community
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-hc-page">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 lg:pb-10">
        <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-hc-caption transition-colors hover:text-hc-ink">
          <ArrowLeft size={13} /> Back
        </button>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-5">
            {/* Pro header card */}
            <div className="overflow-hidden rounded-xl border border-hc-hairline bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-50" />
              <div className="px-5 pb-5 sm:px-6">
                <div className="-mt-10 flex items-end gap-4">
                  {pro.avatar ? (
                    <img src={pro.avatar} alt={pro.name} className="h-16 w-16 rounded-xl border-2 border-white bg-white object-cover shadow-sm" />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-xl border-2 border-white bg-gray-100 text-lg font-bold text-hc-ink-2 shadow-sm">
                      {pro.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 pb-0.5">
                    <p className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-hc-ink">
                      {pro.name}
                      {pro.verified && <BadgeCheck size={16} className="fill-hc-brand text-white" />}
                    </p>
                    <p className="text-xs font-semibold text-hc-ink-2">{pro.trade}</p>
                    {avgRating != null && (
                      <p className="mt-0.5 flex items-center gap-1">
                        <Stars value={avgRating} />
                        <span className="text-[11px] font-bold text-hc-ink">{avgRating}</span>
                        <span className="text-[10px] text-hc-caption">({reviews.length || pro.jobs || 0})</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-hc-hairline pt-3 text-xs font-semibold text-hc-ink-2">
                  {pro.jobs != null && (
                    <span className="flex items-center gap-1"><Briefcase size={12} className="text-gray-400" /> {pro.jobs} jobs</span>
                  )}
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {pro.area || 'Harare'}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className={pro.available ? 'text-emerald-500' : 'text-gray-400'} />
                    <span className={pro.available ? 'text-emerald-600' : 'text-hc-caption'}>{pro.available ? 'Available' : 'Busy'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            {pro.bio && (
              <div className="rounded-xl border border-hc-hairline bg-white p-5 shadow-sm">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-hc-ink-3">About</h2>
                <p className="text-[13px] leading-relaxed text-hc-ink-2 whitespace-pre-wrap">{pro.bio}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="rounded-xl border border-hc-hairline bg-white p-5 shadow-sm">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-hc-ink-3">Skills</h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-hc-tile px-3 py-1 text-xs font-semibold text-hc-ink-2">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="rounded-xl border border-hc-hairline bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-hc-ink-3">Availability</h2>
              <div className="flex flex-wrap gap-2">
                {['Today', 'Tomorrow', 'This Weekend'].map((d) => (
                  <span key={d} className="flex items-center gap-2 rounded-lg border border-hc-hairline px-3 py-2 text-xs font-semibold text-hc-ink-2">
                    <span className={`h-2 w-2 rounded-full ${pro.available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-xl border border-hc-hairline bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-hc-ink-3">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="py-4 text-center text-xs text-hc-caption">No reviews yet.</p>
              ) : (
                <div className="divide-y divide-hc-hairline">
                  {reviews.map((r) => (
                    <div key={r.id} className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
                        {(r.clientName || 'C')[0]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-hc-ink">{r.clientName}</p>
                          <Stars value={r.rating} />
                        </div>
                        {r.comment && <p className="mt-1 text-[13px] leading-relaxed text-hc-ink-2">{r.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio */}
            <div className="rounded-xl border border-hc-hairline bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-hc-ink-3">Portfolio</h2>
              {items.length === 0 ? (
                <p className="py-4 text-center text-xs text-hc-caption">
                  {isOwn ? 'Your portfolio is empty — add projects to showcase your work.' : `${firstName} hasn't added projects yet.`}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((item) => <PortfolioCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          </div>

          {/* Sticky right sidebar */}
          {userRole === 'client' && (
            <aside className="w-full shrink-0 lg:w-[280px]">
              <div className="lg:sticky lg:top-6 space-y-4">
                {/* Action card */}
                <div className="rounded-xl border border-hc-hairline bg-white p-4 shadow-sm">
                  <button
                    onClick={() => openHire('hire')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-hc-brand-strong hover:shadow-md active:scale-[0.98]"
                  >
                    <Briefcase size={16} /> Hire {firstName}
                  </button>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/client/chat/direct/${pro.id}`)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-hc-hairline bg-white px-3 py-2.5 text-xs font-bold text-hc-ink-2 transition-colors hover:bg-gray-50"
                    >
                      <MessageCircle size={14} /> Chat
                    </button>
                    <button
                      onClick={() => openHire('quote')}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-hc-hairline bg-white px-3 py-2.5 text-xs font-bold text-hc-ink-2 transition-colors hover:bg-gray-50"
                    >
                      <Zap size={14} /> Quote
                    </button>
                  </div>
                  {pro.phone && (
                    <a
                      href={`tel:${pro.phone}`}
                      className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-hc-hairline bg-white px-3 py-2.5 text-xs font-bold text-hc-ink-2 transition-colors hover:bg-gray-50"
                    >
                      <Phone size={14} /> Call
                    </a>
                  )}
                </div>

                {/* Quick info card */}
                <div className="rounded-xl border border-hc-hairline bg-white p-4 shadow-sm">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className={pro.available ? 'text-emerald-500' : 'text-gray-400'} />
                      <span className="font-semibold text-hc-ink-2">{pro.available ? 'Available Today' : 'Currently Busy'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="font-semibold text-hc-ink-2">{pro.area || 'Harare'}</span>
                    </div>
                    {pro.jobs != null && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-gray-400" />
                        <span className="font-semibold text-hc-ink-2">{pro.jobs} jobs completed</span>
                      </div>
                    )}
                  </div>
                  {pro.verified && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10">
                      <ShieldCheck size={14} className="shrink-0 text-emerald-600" />
                      <p className="text-[11px] font-bold text-emerald-700">Verified professional</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile sticky action bar */}
      {userRole === 'client' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-hc-hairline bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-lg gap-3">
            <button
              onClick={() => navigate(`/client/chat/direct/${pro.id}`)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hc-hairline py-3 text-xs font-bold text-hc-ink-2 transition-colors hover:bg-gray-100"
            >
              <MessageCircle size={15} /> Message
            </button>
            <button
              onClick={() => openHire('hire')}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-hc-brand py-3 text-xs font-bold text-white shadow-lg shadow-hc-brand/30 transition-colors hover:bg-hc-brand-strong"
            >
              <Briefcase size={15} /> Hire {firstName}
            </button>
          </div>
        </div>
      )}

      <HireProModal pro={pro} isOpen={hireOpen} mode={hireMode} onClose={() => setHireOpen(false)} />
    </div>
  );
}
