import clsx from 'clsx';
export default function Tabs({ tabs, activeTab, onChange, className }) {
  return <div role="tablist" className={clsx('flex gap-1 rounded-xl bg-gray-100 p-1', className)}>{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => onChange(tab.id)} className={clsx('whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors', activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800')}>{tab.label}</button>)}</div>;
}
