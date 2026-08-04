export default function QuickActions({ items }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-black/[0.07] bg-white px-2 py-4 text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:text-hc-ink hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <item.icon size={19} />
          </span>
          <span className="text-xs font-bold">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
