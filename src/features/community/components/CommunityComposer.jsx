import { useState } from 'react';
import { BarChart3, Camera, Images, Plus, Send, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ColoredAvatar from '@/components/ui/ColoredAvatar';
import { JOB_CATEGORIES } from '@/constants/categories';

const clientPrompts = [
  'Need recommendations?',
  'Need advice?',
  'Need quotes?',
  'Help choosing a professional?',
];

const handymanPrompts = [
  "Today's work",
  'Before & After',
  'Maintenance tip',
  'Completed job',
  'New equipment',
];

export default function CommunityComposer({ role, posting, onSubmit, group, user }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [baMode, setBaMode] = useState(false);
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [trade, setTrade] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('project');
  const [error, setError] = useState(null);
  const [pollMode, setPollMode] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expanded, setExpanded] = useState(false);

  const isClient = role === 'client';
  const showFull = expanded || !!text || !!image || pollMode || baMode || !!beforeImage || !!afterImage;

  const submit = async (e) => {
    e.preventDefault();
    if (posting) return;

    if (pollMode) {
      const clean = options.map((o) => o.trim()).filter(Boolean);
      if (!question.trim()) return setError('Add a question for your poll.');
      if (clean.length < 2) return setError('Add at least two poll options.');
      setError(null);
      try {
        await onSubmit({
          text: text.trim(),
          image: null,
          beforeImage: null,
          afterImage: null,
          trade: isClient ? null : (trade || null),
          location: location.trim() || null,
          type: 'poll',
          poll: { question: question.trim(), options: clean.map((o, i) => ({ id: `o${i}`, text: o })) },
        });
        setText('');
        setQuestion('');
        setOptions(['', '']);
        setPollMode(false);
      } catch (err) {
        setError(err?.message || 'Could not post right now. Check your connection and try again — your draft is saved.');
      }
      return;
    }

    if (!text.trim() && !image && !beforeImage && !afterImage) return;
    const resolvedType = isClient ? (image ? 'project' : 'question') : baMode ? 'beforeafter' : type;
    setError(null);
    try {
      await onSubmit({
        text: text.trim(),
        image,
        beforeImage: baMode ? beforeImage : null,
        afterImage: baMode ? afterImage : null,
        trade: isClient ? null : (trade || null),
        location: location.trim() || null,
        type: resolvedType,
      });
      setText('');
      setImage(null);
      setBeforeImage(null);
      setAfterImage(null);
      setBaMode(false);
      setTrade('');
      setLocation('');
      setExpanded(false);
    } catch (err) {
      setError(err?.message || 'Could not post right now. Check your connection and try again — your draft is saved.');
    }
  };

  const attach = (file) => {
    if (!file) return;
    setImage(file);
    setBaMode(false);
    setPollMode(false);
  };

  const setOption = (i, value) => setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));

  const prompts = isClient ? clientPrompts : handymanPrompts;

  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center gap-3">
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'You'} className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
        ) : (
          <ColoredAvatar id={user?.uid} name={user?.displayName || (isClient ? 'Client' : 'Handyman')} className="ring-2 ring-gray-100 dark:ring-gray-700" />
        )}
        <h2 className="text-base font-semibold tracking-tight text-hc-ink dark:text-gray-100">
          {isClient ? 'Ask the Community' : 'Share your work'}
        </h2>
      </div>

      {group && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-hc-ink-2 dark:bg-gray-700 dark:text-gray-300">
          Posting to the <span className="underline">"{group.name}"</span> group
        </div>
      )}

      <form onSubmit={submit}>
        {pollMode ? (
          <div className="space-y-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-hc-ink outline-none transition-colors focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Ask a question… e.g. Which kitchen design do you prefer?"
            />
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={o}
                  onChange={(e) => setOption(i, e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink outline-none transition-colors focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button type="button" onClick={() => setOptions((prev) => [...prev, ''])} className="flex items-center gap-1.5 text-xs font-semibold text-hc-ink-2 hover:text-hc-ink">
                <Plus size={14} /> Add option
              </button>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="2"
              className="w-full resize-none bg-transparent text-sm text-hc-ink outline-none placeholder:text-hc-ink-3 dark:text-gray-100"
              placeholder="Add some context (optional)…"
            />
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setExpanded(true)}
            rows={showFull ? 3 : 2}
            className="w-full resize-none bg-transparent text-sm text-hc-ink outline-none placeholder:text-hc-ink-3 dark:text-gray-100"
            placeholder={isClient
              ? 'Ask anything… e.g. Can anyone recommend a reliable electrician in Borrowdale?'
              : 'Share your latest project… upload before & after photos, give maintenance tips, celebrate completed jobs…'}
          />
        )}

        {!pollMode && showFull && prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setText(text ? `${text} ${p}` : p)}
            className="mr-2 mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-hc-ink-2 transition-colors hover:bg-gray-200 hover:text-hc-ink dark:bg-gray-700 dark:text-gray-300"
          >
            {p}
          </button>
        ))}

        {/* Handyman-only details */}
        {!isClient && showFull && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); if (e.target.value === 'beforeafter') setBaMode(true); }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none transition-colors focus:border-hc-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="project">Project</option>
              <option value="beforeafter">Before & After</option>
              <option value="tip">Maintenance Tip</option>
              <option value="collaboration">Collaboration</option>
            </select>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none transition-colors focus:border-hc-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="">Select trade</option>
              {JOB_CATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none transition-colors focus:border-hc-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                placeholder="Area e.g. Borrowdale"
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
        )}

        {/* Media area */}
        <div className={`mt-5 flex flex-wrap items-center justify-between gap-2 ${showFull ? 'border-t border-gray-100 pt-4' : 'pt-1'}`}>
          <div className="flex flex-wrap items-center gap-1">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-hc-ink-2 transition-colors hover:bg-gray-100 hover:text-hc-ink">
              <Images size={17} /> Photo
              <input type="file" accept="image/*" onChange={(e) => attach(e.target.files?.[0])} className="hidden" />
            </label>
            {!isClient && !pollMode && showFull && (
              <button
                type="button"
                onClick={() => setBaMode(!baMode)}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                  baMode ? 'bg-gray-100 text-hc-ink' : 'text-hc-ink-2 hover:bg-gray-100 hover:text-hc-ink'
                }`}
              >
                <Camera size={17} /> Before & After
              </button>
            )}
            <button
              type="button"
              onClick={() => { setPollMode(!pollMode); setBaMode(false); setImage(null); }}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                pollMode ? 'bg-gray-100 text-hc-ink' : 'text-hc-ink-2 hover:bg-gray-100 hover:text-hc-ink'
              }`}
            >
              <BarChart3 size={17} /> Poll
            </button>
          </div>
          <Button type="submit" fullWidth={false} loading={posting} size="sm" className="rounded-xl" style={{ minHeight: 44 }}>
            <Send size={17} /> {isClient ? 'Ask' : 'Post'}
          </Button>
        </div>

        {image && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-50 p-2 dark:bg-gray-700">
            <img src={URL.createObjectURL(image)} alt="Attachment preview" className="h-14 w-14 rounded-lg object-cover" />
            <p className="min-w-0 flex-1 truncate text-xs text-hc-ink-2 dark:text-gray-300">{image.name}</p>
            <button type="button" onClick={() => setImage(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"><X size={15} /></button>
          </div>
        )}

        {baMode && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="cursor-pointer rounded-xl border border-dashed border-gray-300 p-3 text-center text-xs font-semibold text-hc-ink-2 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-600">
              {beforeImage ? <img src={URL.createObjectURL(beforeImage)} alt="Before" className="mx-auto mb-1 h-20 w-full rounded-lg object-cover" /> : <Camera size={18} className="mx-auto mb-1" />}
              {beforeImage ? 'Change before photo' : 'Upload BEFORE'}
              <input type="file" accept="image/*" onChange={(e) => setBeforeImage(e.target.files?.[0])} className="hidden" />
            </label>
            <label className="cursor-pointer rounded-xl border border-dashed border-gray-300 p-3 text-center text-xs font-semibold text-hc-ink-2 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-600">
              {afterImage ? <img src={URL.createObjectURL(afterImage)} alt="After" className="mx-auto mb-1 h-20 w-full rounded-lg object-cover" /> : <Camera size={18} className="mx-auto mb-1" />}
              {afterImage ? 'Change after photo' : 'Upload AFTER'}
              <input type="file" accept="image/*" onChange={(e) => setAfterImage(e.target.files?.[0])} className="hidden" />
            </label>
          </div>
        )}
      </form>
    </Card>
  );
}
