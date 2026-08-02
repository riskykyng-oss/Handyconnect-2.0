export default function QuickActions({ items }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-100 px-2 py-4 text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600 hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <item.icon size={19} />
          </span>
          <span className="text-xs font-bold">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
