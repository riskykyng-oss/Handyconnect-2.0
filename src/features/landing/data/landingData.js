import { Wrench, Zap, Hammer, Sparkles, Eye, Heart, Search, Users, Shield, Share2 } from 'lucide-react';

export const categories = [
  { name: 'Plumbing', icon: Wrench, gradient: 'from-sky-400 to-blue-600', desc: 'Fixing leaks, pipes & installations' },
  { name: 'Electrical', icon: Zap, gradient: 'from-amber-400 to-orange-600', desc: 'Wiring, switches & safety checks' },
  { name: 'Carpentry', icon: Hammer, gradient: 'from-violet-400 to-indigo-600', desc: 'Custom furniture & woodwork' },
  { name: 'Cleaning', icon: Sparkles, gradient: 'from-pink-400 to-rose-600', desc: 'Deep cleaning & home care' },
  { name: 'Painting', icon: Eye, gradient: 'from-emerald-400 to-teal-600', desc: 'Interior & exterior painting' },
  { name: 'Gardening', icon: Heart, gradient: 'from-lime-400 to-green-600', desc: 'Lawn care & landscaping' },
];

export const testimonials = [
  { quote: '"I found a brilliant electrician within an hour. The whole process felt calm and clear."', name: 'Rudo M.', role: 'Homeowner, Borrowdale' },
  { quote: '"HandyConnect helps me spend time on work, not chasing leads. Clients arrive informed."', name: 'Tawanda C.', role: 'Electrical Professional' },
  { quote: '"I love being able to book people I already trust, then pay in the same place."', name: 'Chipo V.', role: 'Homeowner, Avondale' },
  { quote: '"The community feature changed everything. Now I follow my favorite pros and book in seconds."', name: 'Tanaka G.', role: 'Homeowner, Mt Pleasant' },
];

export const faqs = [
  { q: 'How does HandyConnect work?', a: 'Tell us what needs doing, review quotes from verified professionals, then book and pay securely when the job is complete. Its that simple.' },
  { q: 'Are professionals verified?', a: 'Yes. Every professional completes identity verification and builds a public record through real client ratings and reviews.' },
  { q: 'How much does it cost to post a job?', a: 'Posting is free. You only pay the professional you choose, after agreeing on the scope and price.' },
  { q: 'What if I need help quickly?', a: 'Use the search bar to find nearby available professionals, or post an urgent request and receive quotes within minutes.' },
  { q: 'Is payment secure?', a: 'Absolutely. Payments are held securely and only released to the professional once you confirm the job is complete to your satisfaction.' },
];

export const steps = [
  { num: '01', title: 'Post what you need', desc: 'Share details about your project and get matched with trusted local professionals.', icon: Search },
  { num: '02', title: 'Follow & connect', desc: 'Follow pros whose work you love. See their projects, tips, and before/after photos in your feed.', icon: Users },
  { num: '03', title: 'Hire with confidence', desc: 'Compare quotes, chat in-app, track progress, and release payment when you are happy.', icon: Shield },
  { num: '04', title: 'Share & inspire', desc: 'Post your completed projects, leave reviews, and help the community discover great work.', icon: Share2 },
];
