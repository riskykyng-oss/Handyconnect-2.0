import { useState } from 'react';
import { Check, CheckCheck, MapPin, Mic } from 'lucide-react';
import VoicePlayer from './VoicePlayer';

function ReadReceipt({ read, isOwn }) {
  if (!isOwn) return null;
  return (
    <span className="inline-flex shrink-0">
      {read ? <CheckCheck size={15} className="text-emerald-400" /> : <Check size={15} className="text-white/70" />}
    </span>
  );
}

function TimeBadge({ date }) {
  if (!date) return null;
  return (
    <span className="shrink-0 text-[11px] font-medium leading-none opacity-80">
      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function ChatBubble({ message, isOwn }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const m = message;
  const type = m.type || 'text';

  const bubbleBase = 'max-w-[82%] rounded-[20px] px-4 py-3 shadow-sm break-words';
  const bubbleStyle = isOwn
    ? 'bg-hc-brand text-white rounded-br-[6px]'
    : 'bg-gray-100 text-hc-ink rounded-bl-[6px] dark:bg-gray-700 dark:text-gray-100';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`${bubbleBase} ${bubbleStyle}`}>
        {/* Image message */}
        {type === 'image' && m.attachment?.url && (
          <div className="-mx-4 -mt-3 mb-2 overflow-hidden rounded-t-[20px]">
            {!imgLoaded && <div className="h-48 w-full animate-pulse bg-gray-200 dark:bg-gray-600" />}
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
          <div className="mb-2 min-w-[200px]">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs opacity-75">
              <Mic size={14} />
              <span>Voice note</span>
            </div>
            <VoicePlayer src={m.attachment.url} duration={m.attachment.duration} />
          </div>
        )}
        {/* Location message */}
        {type === 'location' && m.location && (
          <div className="mb-2 overflow-hidden rounded-xl bg-white/10">
            <div className="flex items-center gap-2 p-2.5 text-sm">
              <MapPin size={17} />
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
        {m.text && <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.5]">{m.text}</p>}
        {/* Reply reference */}
        {m.replyTo && (
          <div className={`mt-2 rounded-lg border-l-4 ${isOwn ? 'border-white/40 bg-white/10' : 'border-gray-300 bg-white/50'} px-2.5 py-1.5 text-xs opacity-75`}>
            <p className="font-semibold">{m.replyTo.senderName}</p>
            <p className="truncate">{m.replyTo.text}</p>
          </div>
        )}
        {/* Footer */}
        <div className={`mt-1.5 flex items-end justify-end gap-1 ${isOwn ? 'text-white/80' : 'text-hc-ink-3'}`}>
          <TimeBadge date={m.createdAt} />
          <ReadReceipt read={m.read} isOwn={isOwn} />
        </div>
      </div>
    </div>
  );
}
