import { useEffect, useRef, useState } from 'react';

const SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function RecaptchaWidget({ onVerify, onExpire }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        setReady(true);
        clearInterval(check);
      }
    }, 200);
    return () => clearInterval(check);
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || ref.current.children.length > 0) return;

    window.grecaptcha.render(ref.current, {
      sitekey: SITE_KEY,
      callback: (token) => onVerify(token),
      'expired-callback': () => onExpire?.(),
      theme: 'light',
      size: 'normal',
    });
  }, [ready, onVerify, onExpire]);

  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-hc-ink">Verify you&apos;re not a robot</p>
      <div ref={ref} className="inline-block" />
    </div>
  );
}
