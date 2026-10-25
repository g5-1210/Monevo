import { useEffect, useRef, useState } from 'react';

/* Minimal popover menu. `trigger` receives ({ open, toggle }) and returns a button. */
export default function Dropdown({ trigger, children, align = 'right', label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      {trigger({ open, toggle: () => setOpen(o => !o) })}
      {open && (
        <div className={`dropdown__menu dropdown__menu--${align}`} role="menu" aria-label={label} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ icon, danger, onClick, children, as: As = 'button', ...rest }) {
  return (
    <As role="menuitem" className={`dropdown__item${danger ? ' dropdown__item--danger' : ''}`} onClick={onClick} {...rest}>
      {icon}
      <span>{children}</span>
    </As>
  );
}
