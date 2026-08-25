import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  const Icon = category.icon;
  return (
    <Link
      to={`/client/explore?q=${encodeURIComponent(category.name)}`}
      className="group flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[#FED7AA] hover:shadow-[0_10px_30px_rgba(17,24,39,0.08)] sm:p-6"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF7ED] text-[#F97316] transition-colors group-hover:bg-[#F97316] group-hover:text-white">
        <Icon size={20} />
      </span>
      <h3 className="mt-4 text-[17px] font-semibold text-[#111827]">{category.name}</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-[#6B7280]">{category.desc}</p>
    </Link>
  );
}
