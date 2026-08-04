import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, ChevronRight } from 'lucide-react';
import { subscribeToPosts } from '@/services/postService';
import { timeAgo } from '@/utils/time';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

function Avatar({ post }) {
  if (post.avatar) {
    return <img className="h-10 w-10 rounded-full object-cover shadow-sm" src={post.avatar} alt={post.author} />;
  }
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 shadow-sm">
      {(post.author || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 p-4">
        <Avatar post={post} />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{post.author}</p>
          <p className="text-xs text-gray-400">{post.role && `${post.role} • `}{post.time}</p>
        </div>
      </div>
      <p className="px-4 pb-3 text-sm leading-6 text-gray-600">{post.content}</p>
      {post.image && (
        <div className="overflow-hidden">
          <img className="w-full object-cover transition-transform duration-500 hover:scale-105" src={post.image} alt="Post" />
        </div>
      )}
      <div className="flex items-center gap-5 px-4 py-3 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><Heart size={16} /> {post.likes}</span>
        <span className="flex items-center gap-1.5"><MessageCircle size={16} /> {post.comments}</span>
        <span className="flex items-center gap-1.5"><Share2 size={16} /> Share</span>
      </div>
    </div>
  );
}

export default function CommunitySection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPosts((list) => setPosts(list.slice(0, 3)));
    return unsub;
  }, []);

  const cards = posts.map((p) => ({
    id: p.id,
    author: p.authorName || 'Community member',
    avatar: p.authorAvatar || null,
    role: p.authorTrade || p.authorRole || '',
    time: timeAgo(p.createdAt),
    content: p.text || '',
    image: p.imageUrl || (Array.isArray(p.media) && p.media[0]) || null,
    likes: Array.isArray(p.likes) ? p.likes.length : p.likes || 0,
    comments: p.commentCount || 0,
  }));

  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-32 top-1/3 h-[300px] w-[300px] rounded-full bg-gradient-to-bl from-orange-200/20 to-rose-200/10 blur-[100px]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-orange-600">Social community</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
              See the work.{' '}
              <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Follow the people.</span>
            </h2>
            <p className="mt-4 max-w-lg text-gray-500">
              Professionals share their projects, tips, and before/after photos. Follow the ones you trust and never search for help again.
            </p>
          </div>
          <button className="group inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition-colors hover:text-orange-500">
            View full feed <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        {cards.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white/40 p-10 text-center backdrop-blur-sm">
            <MessageCircle size={28} className="mx-auto text-gray-300" />
            <p className="mt-3 font-display text-lg font-bold text-gray-900">No community posts yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              Once members start sharing their projects and tips, the best posts from the community will show up here.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((post, i) => (
              <motion.div
                key={post.id || i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
