import clsx from 'clsx';

export default function WalletTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-gray-200 bg-gray-100 p-1.5 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors',
            activeTab === tab.id
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          )}
        >
          <tab.icon size={15} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
