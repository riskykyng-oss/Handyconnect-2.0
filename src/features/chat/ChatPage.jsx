import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { sendMessage, subscribeToMessages, markMessagesAsRead } from '@/services/chatService';
import { ArrowLeft, Send, CheckCheck, Check } from 'lucide-react';

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatPage() {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = subscribeToMessages(jobId, (fetchedMessages) => {
      setMessages(fetchedMessages);
      setLoading(false);
    });

    if (currentUser) {
      markMessagesAsRead(jobId, currentUser.uid);
    }

    return () => unsubscribe();
  }, [jobId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const senderName = currentUser.displayName || currentUser.email;
      await sendMessage(jobId, currentUser.uid, senderName, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-200 bg-white">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316] font-bold">
            {jobId?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">Job Chat</h2>
            <p className="text-xs text-gray-400 font-mono">{jobId?.substring(0, 12)}...</p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No messages yet. Say hello!</p>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all ${
                  isMe 
                    ? 'bg-[#F97316] text-white rounded-br-none' 
                    : 'bg-white text-gray-900 border border-slate-100 rounded-bl-none'
                }`}>
                  {!isMe && <p className="text-xs font-bold text-[#F97316] mb-1">{msg.senderName}</p>}
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  
                  <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-orange-100' : 'text-gray-400'}`}>
                    <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      msg.read ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
        <input
          type="text"
          className="flex-1 px-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#F97316] focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit" 
          className="w-12 h-12 flex items-center justify-center bg-[#F97316] hover:bg-orange-600 text-white rounded-xl transition-colors active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20"
          disabled={!newMessage.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}