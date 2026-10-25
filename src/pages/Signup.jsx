import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { PASSWORD_RULES, validateConfirm, validateEmail, validateName, validateNewPassword } from '../utils/validation';
import './Auth.css';

const VALIDATORS = {
  name: (v) => validateName(v),
  email: (v) => validateEmail(v),
  password: (v) => validateNewPassword(v),
  confirm: (v, form) => validateConfirm(v, form.password),
  terms: (v) => (v ? '' : 'Please accept the Terms & Conditions.'),
};

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register, startSession } = useAuth();
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const next = { ...form, [field]: value };
    setForm(next);
    // Re-check fields that currently show an error (and confirm when the password changes).
    setErrors(prev => {
      const out = { ...prev };
      for (const k of [field, ...(field === 'password' ? ['confirm'] : [])]) {
        if (prev[k]) out[k] = VALIDATORS[k](next[k], next);
      }
      return out;
    });
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || success) return;
    const errs = Object.fromEntries(Object.entries(VALIDATORS).map(([k, fn]) => [k, fn(form[k], form)]).filter(([, v]) => v));
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document.getElementById(`signup-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password });
      setSuccess(true);
      // Brief confirmation, then sign the new user in and go to the dashboard.
      timer.current = setTimeout(() => {
        startSession(user, true);
        navigate('/dashboard', { replace: true });
      }, 1100);
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const busy = submitting || success;

  return (
    <div className="auth-page auth-page--reverse">

      {/* Left: Panel */}
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__inner">
          <div className="auth-panel__quote">
            <div className="auth-panel__quote-mark">"</div>
            <p>A budget is telling your money where to go, instead of wondering where it went.</p>
          </div>
          <div className="auth-panel__stats">
            {[
              { val: '10k+',   label: 'Users tracking daily'   },
              { val: '₹4.2Cr', label: 'Total savings tracked'  },
              { val: '4.9★',   label: 'User satisfaction'      },
            ].map(s => (
              <div className="auth-panel__stat" key={s.label}>
                <span className="auth-panel__stat-val">{s.val}</span>
                <span className="auth-panel__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-panel__circle auth-panel__circle--1" aria-hidden="true"/>
        <div className="auth-panel__circle auth-panel__circle--2" aria-hidden="true"/>
        <div className="auth-panel__circle auth-panel__circle--3" aria-hidden="true"/>
      </aside>

      {/* Right: Form */}
      <div className="auth-form-col">
        <div className="auth-form-wrap">

          <Link to="/" className="auth-logo" aria-label="Monevo home">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>
            </svg>
            <span>Monevo</span>
          </Link>

          <div className="auth-heading">
            <h1 className="auth-title">Create Your Monevo Account</h1>
            <p className="auth-sub">
              Start your journey toward smarter money management.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-busy={busy}>
            {success && <p className="auth-alert auth-alert--success" role="status">Account created! Taking you to your dashboard…</p>}
            {formError && (
              <p className="auth-alert auth-alert--error" role="alert">
                {formError}{' '}
                {formError.includes('already exists') && <Link to="/login" className="auth-switch__link">Log in</Link>}
              </p>
            )}
            <div className="auth-fields">
              <InputField
                label="Full Name"
                type="text"
                id="signup-name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
                required
                autoComplete="name"
              />
              <InputField
                label="Email Address"
                type="email"
                id="signup-email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                error={errors.email}
                required
                autoComplete="email"
              />
              <InputField
                label="Password"
                type="password"
                id="signup-password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                required
                autoComplete="new-password"
              />
              <ul className="auth-rules" aria-label="Password requirements">
                {PASSWORD_RULES.map(r => (
                  <li key={r.id} className={r.test(form.password) ? 'is-met' : ''}>
                    <span aria-hidden="true">{r.test(form.password) ? '✓' : '○'}</span>{r.label}
                  </li>
                ))}
              </ul>
              <InputField
                label="Confirm Password"
                type="password"
                id="signup-confirm"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={handleChange('confirm')}
                error={errors.confirm}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Terms */}
            <div className={`auth-terms${errors.terms ? ' auth-terms--error' : ''}`}>
              <label className="auth-check">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={handleChange('terms')}
                  className="auth-check__input"
                  aria-describedby={errors.terms ? 'terms-error' : undefined}
                />
                <span className="auth-check__box" aria-hidden="true"/>
                <span className="auth-check__label">
                  I agree to the{' '}
                  <button type="button" className="auth-forgot">Terms &amp; Conditions</button>
                </span>
              </label>
              {errors.terms && (
                <p className="field__error" id="terms-error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errors.terms}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
              {submitting ? <><span className="auth-spinner" aria-hidden="true" />Creating account…</> : success ? 'Account created' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch__link">Log In</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
