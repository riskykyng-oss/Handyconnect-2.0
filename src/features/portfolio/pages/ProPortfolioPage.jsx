import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, Star, Loader2, Briefcase, Images } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getPublicPro, subscribePortfolio } from '@/services/portfolioService';
import PortfolioCard from '@/features/portfolio/components/PortfolioCard';

export default function ProPortfolioPage() {
  const { proId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const [pro, setPro] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await getPublicPro(proId);
      if (active) setPro(data);
    })();
    return () => { active = false; };
  }, [proId]);

  useEffect(() => {
    if (!proId) return;
    const unsubscribe = subscribePortfolio(proId, (list) => {
      setItems(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [proId]);

  const isOwn = pro?.id === currentUser?.uid;

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-orange-500" size={28} /></div>;
  }

  if (!pro) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-display text-xl font-bold text-gray-900">Professional not found</p>
        <p className="mt-1 text-sm text-gray-500">This profile may have been removed.</p>
        <Link to="/community" className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
          Back to community
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-5 lg:pb-10">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Pro header */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-20 bg-orange-500" />
        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-9 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-4">
              {pro.avatar ? (
                <img src={pro.avatar} alt={pro.name} className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow-sm" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-orange-100 text-lg font-bold text-orange-600 shadow-sm">
                  {pro.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
              <div className="mb-0.5">
                <p className="flex items-center gap-1.5 font-display text-xl font-extrabold text-gray-900">
                  {pro.name}
                  {pro.verified && <BadgeCheck size={18} className="fill-orange-500 text-white" />}
                </p>
                <p className="text-sm font-semibold text-orange-600">{pro.trade}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {userRole === 'client' && (
                <button onClick={() => navigate('/client/home?post=1')} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
                  Hire {pro.name.split(' ')[0]}
                </button>
              )}
              <button onClick={() => navigate(`/${userRole === 'client' ? 'client' : 'handyman'}/chat/direct/${pro.id}`)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50">
                Message
              </button>
              {isOwn && (
                <button onClick={() => navigate('/handyman/portfolio')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50">
                  Manage portfolio
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
            {pro.rating != null && (
              <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                <Star size={14} className="fill-amber-400 text-amber-400" /> {pro.rating}
              </span>
            )}
            {pro.jobs != null && <span>{pro.jobs} jobs</span>}
            {pro.area && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {pro.area}</span>}
            {pro.followers && <span>{pro.followers} followers</span>}
          </div>
          {pro.bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">{pro.bio}</p>}
        </div>
      </div>

      {/* Portfolio grid */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-extrabold text-gray-900">Portfolio</h2>
          <p className="text-xs text-gray-500">{items.length} {items.length === 1 ? 'project' : 'projects'} · tap a photo to zoom</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Images size={30} className="mx-auto text-gray-300" />
          <p className="mt-3 font-display text-lg font-bold text-gray-900">No projects yet</p>
          <p className="mt-1 text-sm text-gray-500">
            {isOwn ? 'Your public portfolio is empty — clients can see exactly what you publish here.' : `${pro.name} hasn't added portfolio projects yet. Check back soon.`}
          </p>
          {isOwn && (
            <button onClick={() => navigate('/handyman/portfolio')} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
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
  );
}
