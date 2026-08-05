import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { isStoryExpired } from '@/services/storyService';

function StoryAvatar({ s }) {
  // Prefer a glimpse of the actual story, fall back to the author avatar, then initials.
  const src = s.image || s.avatar;
  if (src) {
    return <img src={src} alt={s.name} className="h-[72px] w-[72px] rounded-full object-cover" />;
  }
  return (
    <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-hc-tile text-2xl font-bold text-hc-ink-3">
      {(s.name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function StoriesRow({ stories = [], currentUserId, onOpen, onAddStory }) {
  // Your own story sits in its own slot (like Instagram), separate from everyone else.
  const myStory = stories.find((s) => s.authorId && s.authorId === currentUserId);
  const others = stories.filter((s) => !s.authorId || s.authorId !== currentUserId);

  const ringClass = (expired) => (expired ? 'bg-black/[0.08] opacity-60' : 'ring-2 ring-black/[0.06]');

  return (
    <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
      {myStory ? (
        <div className="flex shrink-0 flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onOpen(myStory)}
            role="button"
            aria-label="View your story"
            className="relative cursor-pointer"
          >
            <span className={`block rounded-full p-[3px] ${ringClass(isStoryExpired(myStory))}`}>
              <span className="block rounded-full border-[3px] border-white bg-white">
                <StoryAvatar s={myStory} />
              </span>
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onAddStory(); }}
              aria-label="Add to your story"
              className="absolute -bottom-1 -right-1 z-10 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-hc-brand text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
            >
              <Plus size={15} />
            </button>
          </motion.div>
          <span className="max-w-[80px] truncate text-xs font-medium text-hc-ink-2 dark:text-gray-300">Your story</span>
        </div>
      ) : (
        <button onClick={onAddStory} className="flex shrink-0 flex-col items-center gap-2">
          <span className="grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-dashed border-black/[0.15] bg-white text-hc-ink-3 transition-colors hover:border-black/[0.3] hover:text-hc-ink-2 dark:border-gray-600 dark:bg-gray-800">
            <Plus size={24} />
          </span>
          <span className="text-xs font-medium text-hc-ink-2 dark:text-gray-300">Your story</span>
        </button>
      )}

      {others.map((s, i) => {
        const expired = isStoryExpired(s);
        return (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onOpen(s)}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <span className={`rounded-full p-[3px] ${ringClass(expired)}`}>
              <span className="block rounded-full border-[3px] border-white bg-white">
                <StoryAvatar s={s} />
              </span>
            </span>
            <span className={`max-w-[80px] truncate text-xs font-medium ${expired ? 'text-hc-ink-3' : 'text-hc-ink-2 dark:text-gray-300'}`}>{s.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
