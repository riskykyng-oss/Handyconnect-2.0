import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SquarePen, X, BadgeCheck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/features/auth/context/AuthContext';
import useConversations from '@/hooks/useConversations';
import { createDirectConversation } from '@/services/chatService';
import { subscribeProfessionals } from '@/services/userService';
import ConversationList from '@/components/chat/ConversationList';
import ChatThread from '@/features/chat/ChatThread';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  const { conversations, loading } = useConversations();
  const [pros, setPros] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => subscribeProfessionals(setPros), []);

  const rolePrefix = userRole === 'handyman' ? 'handyman' : 'client';

  const openChat = (conv) => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setSelected(conv);
      setSelectedId(conv.id);
    } else {
      navigate(conv.type === 'direct' ? `/${rolePrefix}/chat/d/${conv.id}` : `/${rolePrefix}/chat/${conv.jobId}`);
    }
  };

  const startDirectChat = async (pro) => {
    if (!currentUser) return;
    const cid = await createDirectConversation(currentUser.uid, pro.id, {
      aName: currentUser.displayName || currentUser.email,
      aAvatar: currentUser.photoURL || null,
      bName: pro.name,
      bAvatar: pro.avatar,
      bTrade: pro.trade,
      bVerified: pro.verified,
      bAvailable: pro.available,
    });
    const snap = await getDoc(doc(db, 'conversations', cid));
    const conv = snap.exists() ? { id: cid, ...snap.data() } : null;
    setPickerOpen(false);
    if (window.matchMedia('(min-width: 1024px)').matches && conv) {
      setSelected(conv);
      setSelectedId(cid);
    } else {
      navigate(`/${rolePrefix}/chat/d/${cid}`);
    }
  };

  const pickerPros = pros
    .filter((p) => p.id !== currentUser?.uid)
    .map((p) => ({
      id: p.id,
      name: p.displayName || p.email || 'Handyman',
      trade: p.trade || (p.skills && p.skills.split(',')[0]) || 'Professional',
      avatar: p.photoURL || null,
      verified: !!p.verified,
      area: p.address || '',
      available: p.available !== false,
    }))
    .filter((p) => !search || `${p.name} ${p.trade}`.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 40);

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-5xl flex-col md:h-[calc(100dvh-5rem)]">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-hc-ink dark:text-gray-100">Messages</h1>
          <p className="text-xs text-hc-caption dark:text-gray-400">{conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}</p>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-hc-brand px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
        >
          <SquarePen size={15} /> New message
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-b-2xl border border-gray-200 border-t-0 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Conversation list */}
        <aside className="flex w-full flex-col lg:w-96 lg:shrink-0 lg:border-r lg:border-gray-100 dark:border-gray-700">
          <div className="border-b border-gray-100 p-3 dark:border-gray-700">
            <div>
              <input
                aria-label="Search conversations"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[16px] outline-none transition-all focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 md:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              loading={loading}
              currentUserId={currentUser?.uid}
              onSelect={openChat}
              search={search}
              selectedId={selectedId}
            />
          </div>
        </aside>

        {/* Thread pane (desktop) */}
        <section className="hidden min-w-0 flex-1 lg:block">
          {selected ? (
            <ChatThread conv={selected} embedded onBack={() => setSelected(null)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-hc-ink-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-500">HC</div>
              <p className="mt-3 text-base font-semibold tracking-tight text-hc-ink">HandyConnect Messenger</p>
              <p className="mt-1 max-w-xs text-center text-sm text-hc-caption">
                Select a conversation, or start a new one with a professional you'd like to work with.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* New message picker */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setPickerOpen(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-hc-ink">New message</h2>
                <p className="text-xs text-hc-caption dark:text-gray-400">Message a professional directly — no job needed</p>
              </div>
              <button onClick={() => setPickerOpen(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {pickerPros.map((pro) => (
                <button
                  key={pro.id}
                  onClick={() => startDirectChat(pro)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {pro.avatar ? (
                    <img src={pro.avatar} alt={pro.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                      {(pro.name || '?').charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-hc-ink">
                      {pro.name}
                      {pro.verified && <BadgeCheck size={14} className="shrink-0 fill-hc-accent text-white" />}
                    </p>
                    <p className="truncate text-xs text-hc-caption dark:text-gray-400">{pro.trade}{pro.area ? ` · ${pro.area}` : ''}</p>
                  </div>
                </button>
              ))}
              {!pickerPros.length && (
                <p className="px-3 py-6 text-center text-sm text-hc-caption dark:text-gray-400">
                  No professionals to message yet. Sign up as a handyman first, or invite someone to join.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
