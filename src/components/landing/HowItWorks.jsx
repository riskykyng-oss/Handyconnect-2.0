import { Search, MessageSquare, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Find a professional',
    desc: 'Search by service and location to find the right person.',
    icon: Search,
  },
  {
    num: '02',
    title: 'Compare & connect',
    desc: 'View profiles, portfolios, and real reviews from past clients.',
    icon: MessageSquare,
  },
  {
    num: '03',
    title: 'Get the job done',
    desc: 'Discuss the scope, agree on a price, and get it completed.',
    icon: CheckCircle,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[32px] font-bold tracking-tight text-[#111827] sm:text-[38px]">
            How HandyConnect Works
          </h2>
          <p className="mt-3 text-[17px] text-[#6B7280]">
            From search to job done in three simple steps.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#F97316]">
                  <Icon size={24} />
                </div>
                <span className="mt-5 inline-block rounded-full bg-[#F8FAFC] px-3 py-1 text-[13px] font-bold text-[#F97316]">
                  {step.num}
                </span>
                <h3 className="mt-3 text-[19px] font-semibold text-[#111827]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
