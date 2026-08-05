import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ChevronRight } from 'lucide-react';
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
    return <img className="h-10 w-10 rounded-full object-cover" src={post.avatar} alt={post.author} />;
  }
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full bg-hc-tile text-sm font-medium text-hc-brand">
      {(post.author || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="flex flex-col rounded-xl border border-hc-hairline bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-3">
        <Avatar post={post} />
        <div className="flex-1">
          <p className="text-[15px] font-medium text-hc-ink">{post.author}</p>
          <p className="text-xs text-hc-ink-3">{post.role && `${post.role} • `}{post.time}</p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-[15px] leading-6 text-hc-ink-2">{post.content}</p>
      {post.image && (
        <div className="mt-3 overflow-hidden rounded-lg border border-hc-hairline">
          <img className="w-full object-cover transition-transform duration-500 hover:scale-105" src={post.image} alt="Post" />
        </div>
      )}
      <div className="mt-4 flex items-center gap-5 border-t border-hc-hairline pt-3 text-xs text-hc-ink-3">
        <span className="flex items-center gap-1.5"><Heart size={16} /> {post.likes}</span>
        <span className="flex items-center gap-1.5"><MessageCircle size={16} /> {post.comments}</span>
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
    <section id="community" className="scroll-mt-20 border-t border-hc-hairline py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="max-w-2xl font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[32px]">
              Latest Community Projects
            </h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-hc-ink-2">
              See real work before you hire.
            </p>
          </div>
          <Link
            to="/community"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-hc-ink-2 transition-colors hover:text-hc-brand"
          >
            View full feed <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {cards.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-hc-hairline bg-white p-10 text-center">
            <MessageCircle size={28} className="mx-auto text-hc-ink-3" />
            <p className="mt-3 text-lg font-medium text-hc-ink">No community posts yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-hc-ink-2">
              Once members start sharing their projects and tips, the best posts from the community will show up here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
