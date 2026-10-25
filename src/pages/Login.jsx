import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import { validateEmail, validateRequiredPassword } from '../utils/validation';
import './Auth.css';

const VALIDATORS = {
  email: (v) => validateEmail(v),
  password: (v) => validateRequiredPassword(v),
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // As the user corrects a field that has an error, re-check it so the message clears immediately.
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: VALIDATORS[field](value) }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const errs = Object.fromEntries(Object.entries(VALIDATORS).map(([k, fn]) => [k, fn(form[k])]).filter(([, v]) => v));
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document.getElementById(`login-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await login(form.email, form.password, remember);
      navigate(location.state?.from ?? '/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left: Form */}
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
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-sub">
              Take control of your finances and continue your journey
              toward smarter money management.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
            {formError && <p className="auth-alert auth-alert--error" role="alert">{formError}</p>}
            <div className="auth-fields">
              <InputField
                label="Email Address"
                type="email"
                id="login-email"
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
                id="login-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="auth-row">
              <label className="auth-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="auth-check__input"
                />
                <span className="auth-check__box" aria-hidden="true"/>
                <span className="auth-check__label">Remember me</span>
              </label>
              <button type="button" className="auth-forgot">Forgot Password?</button>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? <><span className="auth-spinner" aria-hidden="true" />Logging in…</> : 'Log In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-switch__link">Sign Up</Link>
          </p>
        </div>
      </div>

      {/* Right: Panel */}
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__inner">
          <div className="auth-panel__quote">
            <div className="auth-panel__quote-mark">"</div>
            <p>Managing money is not about being rich. It's about being intentional.</p>
          </div>
          <div className="auth-panel__stats">
            {[
              { val: '₹25,500', label: 'Avg. monthly savings' },
              { val: '63%',     label: 'Budget utilization'   },
              { val: '3 min',   label: 'Daily check-in time'  },
            ].map(s => (
              <div className="auth-panel__stat" key={s.label}>
                <span className="auth-panel__stat-val">{s.val}</span>
                <span className="auth-panel__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="auth-panel__circle auth-panel__circle--1" aria-hidden="true"/>
        <div className="auth-panel__circle auth-panel__circle--2" aria-hidden="true"/>
        <div className="auth-panel__circle auth-panel__circle--3" aria-hidden="true"/>
      </aside>

    </div>
  );
}
