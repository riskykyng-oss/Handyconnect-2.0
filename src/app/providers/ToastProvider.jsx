import { Toaster, toast } from 'react-hot-toast';
export { toast };
export function ToastProvider({ children }) {
  return <><Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', background: '#1f2937', color: '#fff' }, success: { iconTheme: { primary: '#f97316', secondary: '#fff' } } }} />{children}</>;
}
