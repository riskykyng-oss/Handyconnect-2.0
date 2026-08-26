import clsx from 'clsx';
export default function Tabs({ tabs, activeTab, onChange, className }) {
  return <div role="tablist" className={clsx('flex gap-1 rounded-xl bg-hc-brand-50 p-1', className)}>{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => onChange(tab.id)} className={clsx('whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors', activeTab === tab.id ? 'bg-hc-surface text-hc-ink shadow-sm' : 'text-hc-ink-3 hover:text-hc-ink-2')}>{tab.label}</button>)}</div>;
}
