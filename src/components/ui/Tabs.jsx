import clsx from 'clsx';
export default function Tabs({ tabs, activeTab, onChange, className }) {
  return <div role="tablist" className={clsx('flex gap-1 rounded-xl bg-black/[0.05] p-1 dark:bg-white/[0.06]', className)}>{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => onChange(tab.id)} className={clsx('whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors', activeTab === tab.id ? 'bg-white text-hc-ink shadow-sm dark:bg-gray-800 dark:text-white' : 'text-hc-ink-3 hover:text-hc-ink-2 dark:text-gray-400 dark:hover:text-gray-200')}>{tab.label}</button>)}</div>;
}
