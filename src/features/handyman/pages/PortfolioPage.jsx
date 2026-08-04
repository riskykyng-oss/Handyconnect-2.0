import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Star, Pencil, Trash2, Eye, Images } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createPortfolioItem, updatePortfolioItem, deletePortfolioItem, subscribePortfolio } from '@/services/portfolioService';
import PortfolioItemForm from '@/features/portfolio/components/PortfolioItemForm';

export default function PortfolioPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribePortfolio(currentUser.uid, (list) => {
      setItems(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  const openCreate = () => { setEditing(null); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openEdit = (item) => { setEditing(item); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) await updatePortfolioItem(currentUser.uid, editing.id, data);
      else await createPortfolioItem(currentUser.uid, data);
      setFormOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}" from your portfolio?`)) return;
    try {
      await deletePortfolioItem(currentUser.uid, item.id);
    } catch { /* Firestore may reject; keep the item listed */ }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-5 lg:pb-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-hc-caption">Portfolio</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-hc-ink">Show clients your best work</h1>
          <p className="mt-1 text-sm text-hc-caption">Projects with photos get the most enquiries. Feature your best ones.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/pro/${currentUser?.uid}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-bold text-hc-ink-2 transition-colors hover:bg-gray-100"
          >
            <Eye size={15} /> View public page
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-hc-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong"
          >
            <Plus size={15} /> Add project
          </button>
        </div>
      </div>

      {formOpen && (
        <div className="mb-6">
          <PortfolioItemForm
            uid={currentUser?.uid}
            initial={editing}
            saving={saving}
            onCancel={() => { setFormOpen(false); setEditing(null); }}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-hc-ink-3" size={28} /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-black/[0.07] bg-white p-10 text-center shadow-sm">
          <Images size={30} className="mx-auto text-hc-ink-3" />
          <p className="mt-3 text-lg font-semibold tracking-tight text-hc-ink">Your portfolio is empty</p>
          <p className="mt-1 text-sm text-hc-caption">Add your first project so clients can see the work you're proud of.</p>
          <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-hc-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong">
            <Plus size={15} /> Add your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-sm">
              <div className="relative">
                {item.beforeImage && item.afterImage ? (
                  <img src={item.afterImage} alt={item.title} className="aspect-[4/3] w-full object-cover" />
                ) : item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full bg-gray-100" />
                )}
                {item.featured && (
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-hc-brand px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    <Star size={10} className="fill-current" /> Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold tracking-tight text-hc-ink">{item.title}</h3>
                    <p className="text-xs font-semibold text-hc-ink-2">{item.trade}</p>
                  </div>
                  {item.price && <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">{item.price}</span>}
                </div>
                {item.location && <p className="mt-1 text-[11px] text-hc-caption">{item.location}</p>}
                <div className="mt-3 flex gap-2 border-t border-black/[0.07] pt-3">
                  <button onClick={() => openEdit(item)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/[0.08] bg-white py-2 text-xs font-bold text-hc-ink-2 transition-colors hover:bg-gray-100">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-50">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
