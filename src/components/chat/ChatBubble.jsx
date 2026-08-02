import { useState } from 'react';
import { Check, CheckCheck, MapPin, Mic } from 'lucide-react';
import VoicePlayer from './VoicePlayer';

function ReadReceipt({ read, isOwn }) {
  if (!isOwn) return null;
  return (
    <span className="ml-1 inline-flex">
      {read ? <CheckCheck size={13} className="text-blue-500" /> : <Check size={13} className="text-gray-400" />}
    </span>
  );
}

function TimeBadge({ date }) {
  if (!date) return null;
  return (
    <span className="text-[10px] text-gray-400">
      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function ChatBubble({ message, isOwn }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const m = message;
  const type = m.type || 'text';

  const bubbleBase = 'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm break-words';
  const bubbleStyle = isOwn
    ? 'bg-orange-500 text-white rounded-br-sm'
    : 'bg-gray-100 text-gray-900 rounded-bl-sm';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2.5`}>
      <div className={`${bubbleBase} ${bubbleStyle}`}>
        {/* Image message */}
        {type === 'image' && m.attachment?.url && (
          <div className="mb-1.5 -mx-4 -mt-2.5 overflow-hidden rounded-t-2xl">
            {!imgLoaded && <div className="h-48 w-full animate-pulse bg-gray-200" />}
            <img
              src={m.attachment.url}
              alt="Shared image"
              className={`w-full max-w-xs object-cover ${imgLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}
        {/* Voice message */}
        {type === 'voice' && m.attachment?.url && (
          <div className="mb-1.5 min-w-[180px]">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] opacity-70">
              <Mic size={12} />
              <span>Voice note</span>
            </div>
            <VoicePlayer src={m.attachment.url} duration={m.attachment.duration} />
          </div>
        )}
        {/* Location message */}
        {type === 'location' && m.location && (
          <div className="mb-1.5 overflow-hidden rounded-xl bg-white/10">
            <div className="flex items-center gap-2 p-2 text-sm">
              <MapPin size={16} />
              <span className="font-medium">Shared location</span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${m.location.lat},${m.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block border-t border-white/10 p-2 text-xs underline opacity-80 hover:opacity-100"
            >
              View on Google Maps
            </a>
          </div>
        )}
        {/* Text content */}
        {m.text && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text}</p>}
        {/* Reply reference */}
        {m.replyTo && (
          <div className={`mt-1.5 rounded-lg border-l-4 ${isOwn ? 'border-white/40 bg-white/10' : 'border-orange-300 bg-white/50'} px-2 py-1 text-xs opacity-70`}>
            <p className="font-semibold">{m.replyTo.senderName}</p>
            <p className="truncate">{m.replyTo.text}</p>
          </div>
        )}
        {/* Footer */}
        <div className={`mt-1 flex items-end justify-end gap-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
          <TimeBadge date={m.createdAt} />
          <ReadReceipt read={m.read} isOwn={isOwn} />
        </div>
      </div>
    </div>
  );
}
