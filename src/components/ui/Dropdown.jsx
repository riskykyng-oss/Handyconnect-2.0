import { useEffect, useRef, useState } from 'react';

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (event) => !ref.current?.contains(event.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return <div ref={ref} className="relative inline-block"><div onClick={() => setOpen(!open)}>{trigger}</div>{open && <div className={`absolute z-40 mt-2 min-w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${align === 'right' ? 'right-0' : 'left-0'}`} onClick={() => setOpen(false)}>{children}</div>}</div>;
}

export function DropdownItem({ children, className = '', ...props }) {
  return <button className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`} {...props}>{children}</button>;
}
