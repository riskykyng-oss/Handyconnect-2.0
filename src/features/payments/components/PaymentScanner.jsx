import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const stopScanner = (scanner) => {
  if (!scanner) return;
  let stopPromise;
  try {
    if (scanner.isScanning) stopPromise = scanner.stop();
  } catch { /* stop() throws if not running */ }
  Promise.resolve(stopPromise)
    .catch(() => {})
    .finally(() => {
      try {
        scanner.clear(); // returns void — no chaining
      } catch { /* ignore */ }
    });
};

export default function PaymentScanner({ onScan, onError }) {
  const containerRef = useRef(null);
  const scannerRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return undefined;

    const scanner = new Html5Qrcode(el.id);
    scannerRef.current = scanner;

    const handleScan = (text) => {
      if (doneRef.current) return;
      doneRef.current = true;
      stopScanner(scanner);
      if (!cancelled) onScan(text);
    };

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.68;
              return { width: Math.max(200, size), height: Math.max(200, size) };
            },
          },
          handleScan,
          () => {}
        );
      } catch (err) {
        if (!cancelled) onError(err?.name === 'NotAllowedError' ? 'Camera permission denied. Use manual code entry below.' : 'Could not start the camera. Use manual code entry below.');
      }
    };

    // Defer a tick so React StrictMode's effect double-invoke settles first;
    // otherwise two Html5Qrcode instances race for the same camera element.
    const timer = setTimeout(() => {
      if (cancelled) return;
      start();
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopScanner(scanner);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="hc-qr-reader" ref={containerRef} className="w-full" />;
}
