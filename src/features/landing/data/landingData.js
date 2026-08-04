import { Wrench, Zap, Hammer, Sparkles, Paintbrush, Droplet, Search, MessageSquare, CalendarCheck, Wallet, Star } from 'lucide-react';

export const categories = [
  { name: 'Plumbing', icon: Wrench, desc: 'Leaks, pipes & installations' },
  { name: 'Electrical', icon: Zap, desc: 'Wiring, switches & safety checks' },
  { name: 'Carpentry', icon: Hammer, desc: 'Custom furniture & woodwork' },
  { name: 'Cleaning', icon: Sparkles, desc: 'Deep cleaning & home care' },
  { name: 'Painting', icon: Paintbrush, desc: 'Interior & exterior painting' },
  { name: 'Gardening', icon: Droplet, desc: 'Lawn care & landscaping' },
];

export const trustBadges = [
  { label: 'Verified professionals', desc: 'Identity-checked before they appear' },
  { label: 'Secure payments', desc: 'Funds released when you approve' },
  { label: 'Real reviews', desc: 'Only completed jobs can be rated' },
  { label: 'Live chat', desc: 'Talk before you commit' },
  { label: 'Location verified', desc: 'Find pros near your home' },
  { label: 'Community moderated', desc: 'Kept honest by real members' },
];

export const testimonials = [
  { quote: 'I found a brilliant electrician within an hour. The whole process felt calm and clear.', name: 'Rudo M.', role: 'Homeowner, Borrowdale' },
  { quote: 'HandyConnect helps me spend time on work, not chasing leads. Clients arrive informed.', name: 'Tawanda C.', role: 'Electrical Professional' },
  { quote: 'I love being able to book people I already trust, then pay in the same place.', name: 'Chipo V.', role: 'Homeowner, Avondale' },
  { quote: 'The community feature changed everything. Now I follow my favorite pros and book in seconds.', name: 'Tanaka G.', role: 'Homeowner, Mt Pleasant' },
];

export const faqs = [
  { q: 'How does HandyConnect work?', a: 'Tell us what needs doing, review quotes from verified professionals, then book and pay securely when the job is complete. It is that simple.' },
  { q: 'Are professionals verified?', a: 'Yes. Every professional completes identity verification and builds a public record through real client ratings and reviews.' },
  { q: 'How much does it cost to post a job?', a: 'Posting is free. You only pay the professional you choose, after agreeing on the scope and price.' },
  { q: 'What if I need help quickly?', a: 'Use the search bar to find nearby available professionals, or post an urgent request and receive quotes within minutes.' },
  { q: 'Is payment secure?', a: 'Absolutely. Payments are held securely and only released to the professional once you confirm the job is complete to your satisfaction.' },
];

export const steps = [
  { num: '01', title: 'Find', desc: 'Search nearby pros and compare quotes, reviews and rates.', icon: Search },
  { num: '02', title: 'Chat', desc: 'Message in-app and agree scope, timing and price.', icon: MessageSquare },
  { num: '03', title: 'Hire', desc: 'Book with confidence and track progress as it happens.', icon: CalendarCheck },
  { num: '04', title: 'Pay', desc: 'Pay securely in the app once the job is done.', icon: Wallet },
  { num: '05', title: 'Review', desc: 'Leave a review so the next person can hire with confidence.', icon: Star },
];

export const stats = [
  { key: 'pros', label: 'Verified professionals', format: (v) => `${v}+` },
  { key: 'jobs', label: 'Jobs completed', format: (v) => `${v}+` },
  { key: 'answered', label: 'Questions answered', format: (v) => `${v}+`, placeholder: true },
  { key: 'reviews', label: 'Real reviews left', format: (v) => `${v}+`, placeholder: true },
];

export const footerColumns = [
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Plumbing', href: '/client/explore?q=Plumbing' },
      { label: 'Electrical', href: '/client/explore?q=Electrical' },
      { label: 'Carpentry', href: '/client/explore?q=Carpentry' },
      { label: 'Cleaning', href: '/client/explore?q=Cleaning' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help centre', href: '/client/help' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Safety', href: '#' },
    ],
  },
];
