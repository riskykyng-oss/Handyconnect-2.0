import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, MapPin, Star, Loader2, Briefcase, Images,
  MessageCircle, Zap, Phone, Clock, ShieldCheck, DollarSign,
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

function SectionTitle({ title, hint }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-semibold tracking-tight text-hc-ink">{title}</h2>
      {hint && <span className="text-xs text-hc-caption">{hint}</span>}
    </div>
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
  const startingAt = pro?.hourlyRate ? pro.hourlyRate : 20;

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
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-5 lg:pb-10">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-hc-caption transition-colors hover:text-hc-ink">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Pro header */}
      <div className="mb-6 overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-sm">
        <div className="h-24 bg-gray-100" />
        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-end gap-4">
                {pro.avatar ? (
                  <img src={pro.avatar} alt={pro.name} className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow-sm" />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-black/[0.06] text-lg font-bold text-hc-ink-2 shadow-sm">
                    {pro.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
                <div className="mb-0.5">
                  <p className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-hc-ink">
                    {pro.name}
                    {pro.verified && <BadgeCheck size={18} className="fill-emerald-500 text-white" />}
                  </p>
                  <p className="text-sm font-semibold text-hc-ink-2">{pro.trade}</p>
                  {avgRating != null && (
                    <p className="mt-0.5 flex items-center gap-1.5">
                      <Stars value={avgRating} />
                      <span className="text-xs font-bold text-hc-ink">{avgRating}</span>
                      <span className="text-[11px] text-hc-caption">({reviews.length || pro.jobs || 0} reviews)</span>
                    </p>
                  )}
                </div>
              </div>

              {userRole === 'client' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/client/chat/direct/${pro.id}`)}
                    className="flex items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-bold text-hc-ink-2 transition-colors hover:bg-gray-100"
                  >
                    <MessageCircle size={16} /> Chat
                  </button>
                  <button
                    onClick={() => openHire('quote')}
                    className="flex items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-bold text-hc-ink-2 transition-colors hover:bg-gray-100"
                  >
                    <Zap size={16} /> Request Quote
                  </button>
                  <button
                    onClick={() => openHire('hire')}
                    className="flex items-center gap-1.5 rounded-xl bg-hc-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
                  >
                    <Briefcase size={16} /> Hire Now
                  </button>
                  {pro.phone && (
                    <a
                      href={`tel:${pro.phone}`}
                      className="flex items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-bold text-hc-ink-2 transition-colors hover:bg-gray-100"
                    >
                      <Phone size={16} /> Call
                    </a>
                  )}
                </div>
              )}
              {isOwn && (
                <button onClick={() => navigate('/handyman/portfolio')} className="rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-bold text-hc-ink-2 transition-colors hover:bg-gray-100">
                  Manage portfolio
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-black/[0.07] pt-4 text-sm">
              {pro.jobs != null && (
                <span className="flex items-center gap-1.5 font-semibold text-hc-ink-2">
                  <Briefcase size={14} className="text-gray-400" /> {pro.jobs} jobs completed
                </span>
              )}
              <span className="flex items-center gap-1.5 font-semibold text-hc-ink-2">
                <MapPin size={14} className="text-gray-400" /> {pro.area || 'Harare'}
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock size={14} className={pro.available ? 'text-emerald-500' : 'text-gray-400'} />
                <span className={pro.available ? 'text-emerald-600' : 'text-hc-caption'}>
                  {pro.available ? 'Available Today' : 'Currently Busy'}
                </span>
              </span>
              {pro.hourlyRate != null && (
                <span className="flex items-center gap-1.5 font-semibold text-hc-ink-2">
                  <DollarSign size={14} className="text-gray-400" /> ${pro.hourlyRate}/hr
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      {pro.bio && (
        <div className="mb-6">
          <SectionTitle title="About" />
          <p className="rounded-xl border border-black/[0.07] bg-white p-5 text-sm leading-relaxed text-hc-ink-2 shadow-sm whitespace-pre-wrap">{pro.bio}</p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <SectionTitle title="Skills" hint={`${skills.length} skills`} />
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="rounded-full border border-black/[0.08] bg-black/[0.06] px-3.5 py-1.5 text-xs font-bold text-hc-ink-2">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="mb-6">
        <SectionTitle title="Pricing" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {pro.hourlyRate != null && (
            <div className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-hc-caption">Hourly Rate</p>
              <p className="mt-1 font-display text-2xl font-semibold text-hc-ink">${pro.hourlyRate}<span className="text-sm font-bold text-hc-caption">/hr</span></p>
            </div>
          )}
          <div className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-hc-caption">Starting From</p>
            <p className="mt-1 font-display text-2xl font-semibold text-hc-ink">${startingAt}</p>
          </div>
          <div className="rounded-xl border border-black/[0.07] bg-hc-tile p-5 shadow-sm">
            <p className="text-xs font-semibold text-hc-ink-2">Emergency Callout</p>
            <p className="mt-1 font-display text-2xl font-semibold text-hc-ink">
              {pro.hourlyRate ? `$${Math.round(pro.hourlyRate * 1.4)}` : '$20'}
            </p>
            <p className="mt-1 text-[11px] text-hc-caption">Urgent jobs may cost more</p>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <SectionTitle title="Availability" />
        <div className="flex flex-wrap gap-2">
          {['Today', 'Tomorrow', 'This Weekend'].map((d) => (
            <span key={d} className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-semibold text-hc-ink-2 shadow-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${pro.available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-6">
        <SectionTitle title="Reviews" hint={reviews.length ? 'Newest first' : undefined} />
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/[0.12] bg-white p-8 text-center">
            <Star className="mx-auto mb-2 h-8 w-8 text-hc-ink-3" />
            <p className="text-sm font-semibold text-hc-caption">No reviews yet</p>
            <p className="mt-1 text-xs text-hc-caption">Reviews from completed jobs will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-bold text-hc-ink">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
                      {(r.clientName || 'C')[0]}
                    </span>
                    {r.clientName}
                  </p>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="text-sm leading-relaxed text-hc-ink-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio */}
      <div>
        <SectionTitle title="Portfolio" hint={`${items.length} ${items.length === 1 ? 'project' : 'projects'}`} />
        {items.length === 0 ? (
          <div className="rounded-xl border border-black/[0.07] bg-white p-10 text-center shadow-sm">
            <Images size={30} className="mx-auto text-hc-ink-3" />
            <p className="mt-3 text-lg font-semibold tracking-tight text-hc-ink">No projects yet</p>
            <p className="mt-1 text-sm text-hc-caption">
              {isOwn ? 'Your public portfolio is empty — clients can see exactly what you publish here.' : `${firstName} hasn't added portfolio projects yet. Check back soon.`}
            </p>
            {isOwn && (
              <button onClick={() => navigate('/handyman/portfolio')} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-hc-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong">
                <Briefcase size={15} /> Add your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <PortfolioCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Verified note */}
      {pro.verified && (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-700">Verified professional — identity and background confirmed.</p>
        </div>
      )}

      {/* Mobile sticky action bar */}
      {userRole === 'client' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.07] bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-lg gap-3">
            <button
              onClick={() => navigate(`/client/chat/direct/${pro.id}`)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] py-3 text-sm font-bold text-hc-ink-2 transition-colors hover:bg-gray-100"
            >
              <MessageCircle size={16} /> Message
            </button>
            <button
              onClick={() => openHire('hire')}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-hc-brand py-3 text-sm font-bold text-white shadow-lg shadow-hc-brand/30 transition-colors hover:bg-hc-brand-strong"
            >
              <Briefcase size={16} /> Hire {firstName}
            </button>
          </div>
        </div>
      )}

      <HireProModal pro={pro} isOpen={hireOpen} mode={hireMode} onClose={() => setHireOpen(false)} />
    </div>
  );
}
