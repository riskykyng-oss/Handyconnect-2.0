import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { isStoryExpired } from '@/services/storyService';

function StoryAvatar({ s }) {
  // Prefer a glimpse of the actual story, fall back to the author avatar, then initials.
  const src = s.image || s.avatar;
  if (src) {
    return <img src={src} alt={s.name} className="h-16 w-16 rounded-full object-cover" />;
  }
  return (
    <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-xl font-bold text-orange-600">
      {(s.name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function StoriesRow({ stories = [], currentUserId, onOpen, onAddStory }) {
  // Your own story sits in its own slot (like Instagram), separate from everyone else.
  const myStory = stories.find((s) => s.authorId && s.authorId === currentUserId);
  const others = stories.filter((s) => !s.authorId || s.authorId !== currentUserId);

  const ringClass = (expired) => (expired ? 'bg-gray-200' : 'bg-gradient-to-tr from-orange-500 to-amber-400');

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
            <span className={`block rounded-full p-[2.5px] ${ringClass(isStoryExpired(myStory))}`}>
              <span className="block rounded-full border-2 border-white bg-white">
                <StoryAvatar s={myStory} />
              </span>
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onAddStory(); }}
              aria-label="Add to your story"
              className="absolute -bottom-1 -right-1 z-10 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-orange-500 text-white shadow-sm transition-colors hover:bg-orange-600"
            >
              <Plus size={14} />
            </button>
          </motion.div>
          <span className="max-w-[72px] truncate text-xs font-medium text-gray-700">Your story</span>
        </div>
      ) : (
        <button onClick={onAddStory} className="flex shrink-0 flex-col items-center gap-2">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-400 transition-colors hover:border-orange-400 hover:text-orange-500">
            <Plus size={22} />
          </span>
          <span className="text-xs font-medium text-gray-600">Your story</span>
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
            <span className={`rounded-full p-[2.5px] ${ringClass(expired)}`}>
              <span className="block rounded-full border-2 border-white bg-white">
                <StoryAvatar s={s} />
              </span>
            </span>
            <span className={`max-w-[72px] truncate text-xs font-medium ${expired ? 'text-gray-400' : 'text-gray-700'}`}>{s.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
