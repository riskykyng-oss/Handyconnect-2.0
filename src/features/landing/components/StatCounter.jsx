import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function StatCounter({ value, format = (v) => `${v}`, label }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return undefined;
    }

    const run = () => {
      if (prefersReducedMotion()) {
        setDisplay(value);
        return;
      }
      const start = performance.now();
      const duration = 1200;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(value * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-[28px] font-medium tracking-tight text-hc-ink sm:text-[36px]">
        {format(display)}
      </p>
      <p className="mt-1 text-[13px] font-medium text-hc-ink-3">{label}</p>
    </div>
  );
}
