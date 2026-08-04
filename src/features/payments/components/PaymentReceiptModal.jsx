import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { ReceiptText, Download, Printer, Mail, Share2, Check, ShieldCheck, Wallet } from 'lucide-react';
import { WalletModal } from '@/features/wallet/components/WalletModal';
import { encodePaymentToken } from '@/services/paymentService';

const normalizeDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value || 0));

const deriveJobRef = (jobId, date) => {
  const year = date ? date.getFullYear() : new Date().getFullYear();
  let hash = 0;
  const src = String(jobId || 'HC');
  for (let i = 0; i < src.length; i += 1) hash = (hash * 31 + src.charCodeAt(i)) % 10000;
  return `HCJ-${year}-${String(hash).padStart(4, '0')}`;
};

const txRef = (id) => `HC-PAY-${String(id || '').slice(0, 4)}-${String(id || '').slice(-4)}`.toUpperCase();

export default function PaymentReceiptModal({ payment, open, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!open || !payment) return null;

  const amount = Number(payment.amount || 0);
  const date = normalizeDate(payment.completedAt);
  const jobRef = deriveJobRef(payment.jobId, date);
  const reference = txRef(payment.id);
  const method = 'HandyConnect Balance';
  const platformFee = 0;
  const taxes = 0;
  const total = amount;

  const rows = [
    ['Client', payment.payerName || 'You'],
    ['Professional', payment.recipientName || '—'],
    ['Service', payment.jobTitle || '—'],
    ['Job number', jobRef],
    ['Date', format(date, 'MMM d, yyyy · h:mm a')],
    ['Payment method', method],
    ['Transaction ID', reference],
  ];

  const receiptText = [
    'HANDYCONNECT — PAYMENT RECEIPT',
    '===============================',
    `Transaction ID:  ${reference}`,
    `Date:            ${format(date, 'MMM d, yyyy h:mm a')}`,
    '',
    'PROFESSIONAL',
    `  Name:    ${payment.recipientName || '—'}`,
    `  Service: ${payment.jobTitle || '—'}`,
    `  Job:     ${jobRef}`,
    '',
    'PAYER',
    `  ${payment.payerName || 'Client'}`,
    '',
    'PAYMENT BREAKDOWN',
    `  Service charge:  $${amount.toFixed(2)}`,
    `  Platform fee:    $${platformFee.toFixed(2)}`,
    `  Taxes:           $${taxes.toFixed(2)}`,
    `  TOTAL PAID:      $${total.toFixed(2)} (via ${method})`,
    '',
    'Status: Completed. Funds credited to the professional.',
    '',
    'Thanks for using HandyConnect!',
  ].join('\n');

  const download = () => {
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handyconnect-receipt-${reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  const print = () => {
    const win = window.open('', '_blank', 'width=680,height=920');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>HandyConnect receipt ${reference}</title>
      <style>
        body{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111827;margin:0;padding:32px;max-width:640px}
        .brand{font-weight:800;font-size:18px;color:#ea580c}
        .amount{font-size:40px;font-weight:800;margin:16px 0 4px}
        .muted{color:#6b7280;font-size:13px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-top:24px;font-size:14px}
        .grid b{display:block}
        .total{margin-top:24px;border-top:1px dashed #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;font-weight:800}
        .break{margin-top:16px;font-size:14px}
        .qr{margin-top:24px}
      </style></head><body>
      <div class="brand">HANDYCONNECT</div>
      <div class="muted">Payment receipt · ${reference}</div>
      <div class="amount">$${total.toFixed(2)}</div>
      <div class="muted">Paid via ${method} · ${format(date, 'MMM d, yyyy · h:mm a')}</div>
      <div class="grid">
        <div><b>Client</b>${payment.payerName || 'You'}</div>
        <div><b>Professional</b>${payment.recipientName || '—'}</div>
        <div><b>Service</b>${payment.jobTitle || '—'}</div>
        <div><b>Job number</b>${jobRef}</div>
        <div><b>Payment method</b>${method}</div>
        <div><b>Transaction ID</b>${reference}</div>
      </div>
      <div class="break">
        <p>Service charge: <b>$${amount.toFixed(2)}</b></p>
        <p>Platform fee: <b>$${platformFee.toFixed(2)}</b></p>
        <p>Taxes: <b>$${taxes.toFixed(2)}</b></p>
      </div>
      <div class="total"><span>Total paid</span><span style="color:#059669">$${total.toFixed(2)}</span></div>
      <p class="muted" style="margin-top:32px">Status: Completed. Funds credited to the professional. This receipt is verified by HandyConnect.</p>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  const email = () => {
    const subject = encodeURIComponent(`HandyConnect receipt ${reference}`);
    const body = encodeURIComponent(receiptText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `HandyConnect receipt ${reference}`, text: receiptText });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <WalletModal
      open={open}
      onClose={onClose}
      icon={<ReceiptText size={18} />}
      title="Payment receipt"
      subtitle={reference}
    >
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Total paid</p>
          <p className="mt-1 font-display text-4xl font-semibold text-emerald-600 dark:text-emerald-400">${total.toFixed(2)}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
            <Wallet size={12} /> via {method}
          </p>
        </div>

        <dl className="mt-4 space-y-2.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-gray-400">{label}</dt>
              <dd className="truncate text-right font-semibold text-hc-ink dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800/60">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Payment breakdown</p>
          <div className="space-y-1">
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Service charge</span><span>${amount.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Platform fee</span><span>${platformFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Taxes</span><span>${taxes.toFixed(2)}</span></div>
            <div className="mt-1 flex justify-between border-t border-dashed border-gray-300 pt-1 font-semibold text-emerald-600 dark:border-gray-700 dark:text-emerald-400">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex w-fit items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-700">
            <QRCodeSVG value={encodePaymentToken(payment.id)} size={120} fgColor="#111827" bgColor="transparent" />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-hc-ink dark:text-white">
            <ShieldCheck size={14} className="text-emerald-500" /> Verified receipt
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Scan this code to verify authenticity or share it with support for disputes.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={download} className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800">
            <Download size={14} /> Download
          </button>
          <button onClick={print} className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
            <Printer size={14} /> Print
          </button>
          <button onClick={email} className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
            <Mail size={14} /> Email
          </button>
          <button onClick={share} className="flex items-center justify-center gap-1.5 rounded-xl bg-hc-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong">
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
          <ShieldCheck size={12} className="text-emerald-500" /> Encrypted and protected by HandyConnect
        </p>
      </div>
    </WalletModal>
  );
}
