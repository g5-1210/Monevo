import Icon from './Icon';
import { categoryById } from '../../data/categories';
import { initials } from '../../utils/format';

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__sub">{subtitle}</p>}
      </div>
      {children && <div className="page-header__actions">{children}</div>}
    </header>
  );
}

export function Badge({ tone, dot, children }) {
  return (
    <span className={`badge${tone ? ` badge--${tone}` : ''}`}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** tone: 'primary' | 'success' | 'warning' | 'danger' */
export function ProgressBar({ value, tone, size, label }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`progress${tone ? ` progress--${tone}` : ''}${size ? ` progress--${size}` : ''}`}
      role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}
    >
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function CategoryIcon({ category, size = 'md' }) {
  const c = categoryById(category);
  return (
    <span className={`cat-chip${size === 'sm' ? ' cat-chip--sm' : size === 'lg' ? ' cat-chip--lg' : ''}`} style={{ '--chip': c.color }}>
      <Icon name={c.icon} size={size === 'sm' ? 15 : size === 'lg' ? 21 : 18} />
    </span>
  );
}

export function Avatar({ name, src, large }) {
  return (
    <span className={`avatar${large ? ' avatar--lg' : ''}`} aria-hidden="true">
      {src ? <img src={src} alt="" className="avatar__img" /> : initials(name)}
    </span>
  );
}

export function EmptyState({ icon = 'inbox', title, text, action, secondary, compact }) {
  return (
    <div className={`state${compact ? ' state--compact' : ''}`}>
      <div className="state__icon"><Icon name={icon} size={24} /></div>
      <h3 className="state__title">{title}</h3>
      {text && <p className="state__text">{text}</p>}
      {(action || secondary) && <div className="state__actions">{action}{secondary}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', text, onRetry }) {
  return (
    <div className="state" role="alert">
      <div className="state__icon state__icon--danger"><Icon name="wifi-off" size={24} /></div>
      <h3 className="state__title">{title}</h3>
      {text && <p className="state__text">{text}</p>}
      {onRetry && (
        <div className="state__actions">
          <button className="btn btn-primary" onClick={onRetry}><Icon name="refresh" size={15} /> Try again</button>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ w = '100%', h = 14, r, style }) {
  return <span className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />;
}

export function Switch({ checked, onChange, label, id, disabled }) {
  return (
    <label className="switch">
      <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="switch__track" aria-hidden="true" />
    </label>
  );
}

export function Segmented({ options, value, onChange, full, label }) {
  return (
    <div className={`segmented${full ? ' segmented--full' : ''}`} role="group" aria-label={label}>
      {options.map(o => (
        <button key={o.value} type="button" className="segmented__btn"
          aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
