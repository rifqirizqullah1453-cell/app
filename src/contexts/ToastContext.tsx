import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

const ToastContext = createContext({ toast: (_message: string, _type: Toast['type'] = 'info') => {} });
export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = { success: '#10B981', error: '#EF4444', info: '#3B9BFF' };
  const bgMap = { success: '#ECFDF5', error: '#FEF2F2', info: '#EBF4FF' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 max-w-sm rounded-2xl shadow-lg border border-slate-100" style={{ background: 'white' }}>
                <Icon className="w-5 h-5 shrink-0" style={{ color: colors[t.type] }} />
                <span className="text-sm font-semibold" style={{ color: '#0C1929' }}>{t.message}</span>
                <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-4 h-4" style={{ color: '#8899AA' }} /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
