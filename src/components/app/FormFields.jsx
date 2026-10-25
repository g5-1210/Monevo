import Icon from './Icon';

/* Thin wrappers that reuse the .field styles from components/InputField.css so
   selects, textareas and money inputs look identical to the login/signup inputs. */

function Shell({ id, label, required, error, hint, valid, children }) {
  return (
    <div className={`field${error ? ' field--error' : valid ? ' field--valid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}{required && <span className="field__req" aria-hidden="true"> *</span>}
        {!required && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          <Icon name="alert" size={12} strokeWidth={2.4} />{error}
        </p>
      ) : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}

const aria = (id, error, required) => ({
  'aria-invalid': error ? 'true' : 'false',
  'aria-describedby': error ? `${id}-error` : undefined,
  'aria-required': required ? 'true' : undefined,
});

export function TextField({ id, label, required, error, hint, valid, prefix, ...props }) {
  return (
    <Shell {...{ id, label, required, error, hint, valid }}>
      <div className={`field__wrap${prefix ? (prefix.length > 1 ? ' field__wrap--prefix-wide' : ' field__wrap--prefix') : ''}`}>
        {prefix && <span className="field__affix">{prefix}</span>}
        <input id={id} className="field__input" {...aria(id, error, required)} {...props} />
      </div>
    </Shell>
  );
}

export function SelectField({ id, label, required, error, hint, options, placeholder, ...props }) {
  return (
    <Shell {...{ id, label, required, error, hint }}>
      <div className="field__wrap">
        <select id={id} className="field__input field__select" {...aria(id, error, required)} {...props}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevron-down" size={16} className="field__chev" />
      </div>
    </Shell>
  );
}

export function TextAreaField({ id, label, required, error, hint, ...props }) {
  return (
    <Shell {...{ id, label, required, error, hint }}>
      <textarea id={id} className="field__input field__textarea" {...aria(id, error, required)} {...props} />
    </Shell>
  );
}

/** Radio-style toggle, e.g. Income / Expense. */
export function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div className="segmented segmented--full" role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button key={o.value} type="button" role="radio"
          className={`segmented__btn${o.tone ? ` segmented__btn--${o.tone}` : ''}`}
          aria-checked={value === o.value} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} size={15} />}{o.label}
        </button>
      ))}
    </div>
  );
}

/* Validation helpers shared by the forms. */
export const parseAmount = (v) => Number(String(v).replace(/,/g, ''));
export const isPositive = (v) => Number.isFinite(parseAmount(v)) && parseAmount(v) > 0;
