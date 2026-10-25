import { useCallback, useRef, useState } from 'react';
import Icon from '../../components/app/Icon';
import DataBoundary from '../../components/app/DataBoundary';
import { PageHeader, Avatar, Switch, Segmented } from '../../components/app/ui';
import { TextField, SelectField } from '../../components/app/FormFields';
import { CardSkeleton, PageHeaderSkeleton } from '../../components/app/Skeletons';
import DeleteAccountDialog from '../../components/settings/DeleteAccountDialog';
import ClearDataDialog from '../../components/settings/ClearDataDialog';
import { useForm } from '../../components/app/useForm';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';
import { CURRENCIES, DATE_FORMATS, formatDate } from '../../utils/format';
import { todayISO } from '../../utils/dates';
import { validateEmail, validateName, validateNewPassword } from '../../utils/validation';
import './settings.css';

function Section({ id, title, text, children }) {
  return (
    <section className="card settings-card" id={id} aria-labelledby={`${id}-title`}>
      <div className="settings-card__intro">
        <h2 className="card__title" id={`${id}-title`}>{title}</h2>
        <p className="card__sub">{text}</p>
      </div>
      <div className="settings-card__body">{children}</div>
    </section>
  );
}

function ProfileSection() {
  const { user, actions } = useData();
  const toast = useToast();
  const fileRef = useRef(null);
  const validate = useCallback((v) => {
    const e = {};
    const name = validateName(v.name);
    const email = validateEmail(v.email);
    if (name) e.name = name;
    if (email) e.email = email;
    return e;
  }, []);
  const form = useForm({ name: user.name, email: user.email }, validate);
  const dirty = form.values.name !== user.name || form.values.email !== user.email;

  const save = form.handleSubmit(async (v) => {
    await actions.updateUser({ name: v.name.trim(), email: v.email.trim() });
    toast.success('Profile updated.');
  });

  const pick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file.'); return; }
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

    if (file.size > MAX_FILE_SIZE) {
  toast.error('Image must be 15 MB or smaller.');
  return;
}
    const reader = new FileReader();
    reader.onload = () => {
      actions.updateUser({ avatar: reader.result })
        .then(() => toast.success('Profile picture updated.'))
        .catch((err) => toast.error(err.message));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <Section id="profile" title="Profile" text="Your name and contact details.">
      <div className="profile-pic">
        <Avatar name={user.name} src={user.avatar} large />
        <div>
          <div className="profile-pic__btns">
            <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>Change photo</button>
            {user.avatar && <button className="btn btn-ghost btn-sm" onClick={() => actions.updateUser({ avatar: '' }).catch((err) => toast.error(err.message))}>Remove</button>}
          </div>
          <p className="field__hint">JPG or PNG, up to 15 MB.</p>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
        </div>
      </div>
      <form onSubmit={save} noValidate className="form-stack">
        {form.formError && <div className="form-error" role="alert"><Icon name="alert" size={16} />{form.formError}</div>}
        <div className="form-grid">
          <TextField id="set-name" label="Full name" required autoComplete="name" {...form.field('name')} />
          <TextField id="set-email" label="Email address" required type="email" autoComplete="email" {...form.field('email')} />
        </div>
        <div><button className="btn btn-primary" type="submit" disabled={!dirty || form.saving}>{form.saving && <span className="spinner" />}Save changes</button></div>
      </form>
    </Section>
  );
}

function PreferencesSection() {
  const { prefs, actions } = useData();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const update = (data, msg = 'Preferences saved.') => { actions.updatePrefs(data); toast.success(msg); };

  return (
    <Section id="preferences" title="Preferences" text="How Monevo looks and formats your data.">
      <div className="pref-row">
        <div><strong>Theme</strong><p className="field__hint">Choose light or dark appearance.</p></div>
        <Segmented label="Theme" value={theme} onChange={(v) => { if (v !== theme) toggle(); }} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </div>
      <div className="form-grid">
        <SelectField id="set-currency" label="Currency" required value={prefs.currency}
          hint="Changes the symbol and number format only — amounts aren't converted."
          options={Object.entries(CURRENCIES).map(([v, c]) => ({ value: v, label: c.label }))}
          onChange={(e) => update({ currency: e.target.value })} />
        <SelectField id="set-date" label="Date format" required value={prefs.dateFormat}
          hint={`Example: ${formatDate(todayISO(), prefs.dateFormat)}`}
          options={Object.keys(DATE_FORMATS).map(v => ({ value: v, label: v }))}
          onChange={(e) => update({ dateFormat: e.target.value })} />
      </div>
    </Section>
  );
}

const NOTIF_OPTIONS = [
  { key: 'budgetAlerts', title: 'Budget alerts', text: 'When a budget is nearly used or exceeded.' },
  { key: 'paymentReminders', title: 'Payment reminders', text: 'A heads-up before recurring payments are due.' },
  { key: 'weeklySummary', title: 'Weekly summary', text: 'A short recap of your week every Monday.' },
  { key: 'monthlySummary', title: 'Monthly summary', text: 'Income, spending and savings at month end.' },
];

function NotificationsSection() {
  const { prefs, actions } = useData();
  return (
    <Section id="notifications" title="Notifications" text="Choose what Monevo tells you about.">
      <ul className="toggle-list">
        {NOTIF_OPTIONS.map(o => (
          <li key={o.key}>
            <div><strong>{o.title}</strong><p className="field__hint">{o.text}</p></div>
            <Switch label={o.title} checked={prefs.notifications[o.key]} onChange={(v) => actions.updateNotificationPrefs({ [o.key]: v })} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SecuritySection() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const validate = useCallback((v) => {
    const e = {};
    if (!v.current) e.current = 'Enter your current password.';
    const next = validateNewPassword(v.next);
    if (next) e.next = next;
    else if (v.next === v.current) e.next = 'New password must be different.';
    if (!v.confirm) e.confirm = 'Confirm your new password.';
    else if (v.confirm !== v.next) e.confirm = "Passwords don't match.";
    return e;
  }, []);
  const form = useForm({ current: '', next: '', confirm: '' }, validate);

  const submit = form.handleSubmit(async (v) => {
    await changePassword(v.current, v.next);
    form.reset();
    toast.success('Password updated.');
  });

  return (
    <Section id="security" title="Security" text="Keep your account protected.">
      <form onSubmit={submit} noValidate className="form-stack">
        <h3 className="settings-sub">Change password</h3>
        {form.formError && <div className="form-error" role="alert"><Icon name="alert" size={16} />{form.formError}</div>}
        <TextField id="pw-current" label="Current password" required type="password" autoComplete="current-password" {...form.field('current')} />
        <div className="form-grid">
          <TextField id="pw-new" label="New password" required type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." {...form.field('next')} />
          <TextField id="pw-confirm" label="Confirm new password" required type="password" autoComplete="new-password" {...form.field('confirm')} />
        </div>
        <div><button className="btn btn-primary" type="submit" disabled={form.saving}>{form.saving && <span className="spinner" />}Update password</button></div>
      </form>
    </Section>
  );
}

function AccountSection() {
  const { logout, deleteAccount } = useAuth();
  const { actions } = useData();
  const ui = useUI();
  const toast = useToast();
  const [dialog, setDialog] = useState(null); // 'clear' | 'delete'

  const out = () => ui.confirm({
    title: 'Log out of Monevo?', icon: 'log-out', tone: 'primary', confirmLabel: 'Log out',
    message: "You'll need to log in again to see your finances.",
    onConfirm: logout,
  });

  const clearData = async () => {
    await actions.clearAccountData();
    setDialog(null);
    toast.success('Account data cleared. You have a fresh start.');
  };

  const removeAccount = () => deleteAccount();

  const loadSample = () => ui.confirm({
    title: 'Load sample data?', icon: 'download', tone: 'primary', confirmLabel: 'Load sample data',
    message: 'This replaces your current transactions, budgets, goals and recurring payments with demo data so you can explore Monevo.',
    onConfirm: () => { actions.loadSampleData(); toast.success('Sample data loaded.'); },
  });

  return (
    <Section id="account" title="Account" text="Session, your data, and account deletion.">
      <div className="pref-row">
        <div><strong>Log out</strong><p className="field__hint">End your session on this device.</p></div>
        <button className="btn btn-secondary" onClick={out}><Icon name="log-out" size={16} />Log out</button>
      </div>

      <div className="settings-divider" />
      <div className="pref-row">
        <div>
          <strong>Clear Account Data</strong>
          <p className="field__hint">Remove your transactions, budgets, goals, recurring payments and preferences. Your account and login are kept.</p>
        </div>
        <div className="pref-row__btns">
          <button className="btn btn-ghost btn-sm" onClick={loadSample}>Load sample data</button>
          <button className="btn btn-danger-ghost" onClick={() => setDialog('clear')}><Icon name="trash" size={16} />Clear data</button>
        </div>
      </div>

      <div className="danger-zone">
        <div><strong>Delete account</strong><p className="field__hint">Permanently delete your login, profile and all data. This is different from clearing data.</p></div>
        <button className="btn btn-danger-ghost" onClick={() => setDialog('delete')}><Icon name="trash" size={16} />Delete account</button>
      </div>

      {dialog === 'clear' && <ClearDataDialog onClose={() => setDialog(null)} onConfirm={clearData} />}
      {dialog === 'delete' && <DeleteAccountDialog onClose={() => setDialog(null)} onConfirm={removeAccount} />}
    </Section>
  );
}

const TABS = [['profile', 'Profile'], ['preferences', 'Preferences'], ['notifications', 'Notifications'], ['security', 'Security'], ['account', 'Account']];

function Settings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences and account." />
      <nav className="settings-nav" aria-label="Settings sections">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{label}</button>
        ))}
      </nav>
      <div className="settings-stack">
        <ProfileSection />
        <PreferencesSection />
        <NotificationsSection />
        <SecuritySection />
        <AccountSection />
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <DataBoundary skeleton={<><PageHeaderSkeleton /><CardSkeleton height={200} /></>}>
      <Settings />
    </DataBoundary>
  );
}
