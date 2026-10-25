import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from '../components/app/Icon';
import '../components/app/Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts(l => l.filter(t => t.id !== id)), []);
  const push = useCallback((tone, message) => {
    const id = ++idRef.current;
    setToasts(l => [...l.slice(-2), { id, tone, message }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error:   (m) => push('danger', m),
    info:    (m) => push('info', m),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <Icon name={t.tone === 'danger' ? 'alert' : t.tone === 'info' ? 'info' : 'check-circle'} size={18} />
            <span className="toast__msg">{t.message}</span>
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss"><Icon name="x" size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
