import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Centered dialog on desktop, bottom sheet on mobile (see .modal in app.css). */
export default function Modal({ title, subtitle, onClose, children, footer, size, icon, iconTone, labelledBy = 'modal-title' }) {
  const ref = useRef(null);

  useEffect(() => {
    const prevFocus = document.activeElement;
    const node = ref.current;
    const first = node.querySelector('[data-autofocus]') ?? node.querySelector(FOCUSABLE);
    first?.focus();
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const items = [...node.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const a = items[0], b = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className={`modal${size ? ` modal--${size}` : ''}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <div className="modal__head">
          <div>
            {icon && <div className={`modal__icon modal__icon--${iconTone ?? 'primary'}`}><Icon name={icon} size={22} /></div>}
            <h2 className="modal__title" id={labelledBy}>{title}</h2>
            {subtitle && <p className="modal__sub">{subtitle}</p>}
          </div>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close dialog"><Icon name="x" size={18} /></button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', tone = 'danger', icon = 'trash', onConfirm, onClose, busy }) {
  return (
    <Modal
      size="sm" title={title} icon={icon} iconTone={tone === 'danger' ? 'danger' : 'primary'} onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} data-autofocus>Cancel</button>
          <button className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
            {busy && <span className="spinner" />} {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{message}</p>
    </Modal>
  );
}
