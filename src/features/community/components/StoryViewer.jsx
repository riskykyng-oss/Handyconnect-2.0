import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { isStoryExpired, hoursLeft } from '@/services/storyService';
import { timeAgo } from '@/utils/time';

const STORY_DURATION = 5000;

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const story = stories[index];
  const expired = isStoryExpired(story);
  const duration = expired ? 2000 : STORY_DURATION;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(stories.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, stories.length]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => (index === stories.length - 1 ? onClose() : setIndex(index + 1));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Close story"
        >
          <X size={19} />
        </button>

        {index > 0 && (
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" aria-label="Previous story">
            <ChevronLeft size={20} />
          </button>
        )}
        {index < stories.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" aria-label="Next story">
            <ChevronRight size={20} />
          </button>
        )}

        <motion.div
          key={index}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex h-full max-h-[820px] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl"
        >
          {/* Progress bars */}
          <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-3">
            {stories.map((s, i) => (
              <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                {i === index && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                    onAnimationComplete={next}
                    className="h-full bg-white"
                  />
                )}
                {i < index && <div className="h-full bg-white" />}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute left-0 right-0 top-6 z-20 flex items-center gap-3 px-4 pt-3">
            <span className="rounded-full bg-white/20 p-[2px]">
              <img src={story.avatar} alt={story.name} className="h-10 w-10 rounded-full border-2 border-gray-900 object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{story.name}</p>
              <p className="truncate text-xs text-white/60">{story.trade} &middot; {timeAgo(story.postedAt)}</p>
            </div>
            {expired ? (
              <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-[10px] font-bold text-red-300">Expired</span>
            ) : (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white/80">Expires in {hoursLeft(story)}h</span>
            )}
          </div>

          {/* Story media */}
          <div className="relative flex-1">
            <img src={story.image} alt={story.caption} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </div>

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
            <p className="font-display text-lg font-semibold text-white">{story.caption}</p>
            {expired && <p className="mt-1 text-xs text-white/60">This story has passed the 24-hour window.</p>}
          </div>

          {/* Tap zones */}
          <div className="absolute inset-0 z-10 flex">
            <button className="flex-1" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" />
            <button className="flex-1" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
