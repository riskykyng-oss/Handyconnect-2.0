import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, MessageCircle, Mail, Phone, AlertTriangle,
  HelpCircle, CreditCard, Briefcase, Users, User,
  ExternalLink,
} from 'lucide-react';
import Card from '@/components/ui/Card';

const faqs = [
  { q: 'How do I hire a professional?', a: 'Search for the service you need on the Explore page, browse profiles, check ratings and reviews, then tap "Hire" to send a request. The professional will confirm and you can start chatting.' },
  { q: 'How do payments work?', a: 'Payments are processed through our secure escrow system. Funds are held safely until the job is completed to your satisfaction, then released to the professional.' },
  { q: 'Can I cancel a job?', a: 'You can cancel an open job anytime. If a professional has already been assigned, cancellation terms may apply depending on the stage of the job.' },
  { q: 'How do I leave a review?', a: 'After a job is completed, you\'ll receive a prompt to rate and review the professional. Reviews help the community make informed decisions.' },
  { q: 'How do I change my password?', a: 'Go to Settings > Account > Password. You\'ll need your current password to set a new one. If you\'ve forgotten it, use the "Forgot Password" option on the login screen.' },
  { q: 'How do I report an issue?', a: 'Use the "Report" option on any profile, message, or job card. Our support team will review and take appropriate action within 24 hours.' },
];

const quickHelp = [
  { label: 'Payments', icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Jobs', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  { label: 'Messages', icon: MessageCircle, color: 'bg-purple-100 text-purple-600' },
  { label: 'Account', icon: User, color: 'bg-orange-100 text-orange-600' },
  { label: 'Community', icon: Users, color: 'bg-rose-100 text-rose-600' },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="font-display text-2xl font-extrabold text-gray-900">Need Help?</h1>
        <p className="mt-1 text-sm text-gray-500">We're here for you, every step of the way.</p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles..."
          className="h-[52px] w-full rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none shadow-sm transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 placeholder:text-gray-400"
        />
      </div>

      {/* Quick Help */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {quickHelp.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:shadow-md"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.color}`}>
                <Icon size={15} />
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="font-display text-lg font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <Card className="divide-y divide-gray-100 !p-0 overflow-hidden">
          {filteredFaqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <HelpCircle size={16} className="shrink-0 text-orange-500" />
                <span className="flex-1 text-sm font-semibold text-gray-900">{faq.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Card>
      </div>

      {/* Contact */}
      <div>
        <h2 className="font-display text-lg font-extrabold text-gray-900 mb-4">Contact Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Live Chat', desc: 'Chat with our support team', icon: MessageCircle, color: 'bg-orange-100 text-orange-600', action: () => navigate('/client/messages') },
            { label: 'Email', desc: 'support@handyconnect.com', icon: Mail, color: 'bg-blue-100 text-blue-600' },
            { label: 'Phone', desc: '+263 78 123 4567', icon: Phone, color: 'bg-green-100 text-green-600' },
            { label: 'WhatsApp', desc: 'Chat on WhatsApp', icon: MessageCircle, color: 'bg-emerald-100 text-emerald-600' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ y: -2 }}
                onClick={item.action}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-left transition-shadow hover:shadow-md"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                </div>
                <ExternalLink size={14} className="shrink-0 text-gray-400" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Emergency */}
      <Card className="border-red-200 bg-red-50 !p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-red-900">Emergency Support</h3>
            <p className="mt-1 text-xs text-red-700">For urgent issues like fraud or abuse, contact us immediately.</p>
            <div className="mt-3 flex gap-3">
              <button className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors">Report Abuse</button>
              <button className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">Report Fraud</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
