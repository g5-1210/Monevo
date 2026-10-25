import { useState } from 'react';
import Modal from '../app/Modal';
import Icon from '../app/Icon';

const ITEMS = [
  'Transactions (income and expenses)',
  'Budgets and savings goals',
  'Recurring payments',
  'Notifications',
  'Preferences (currency, date format, alert settings)',
];

/* Confirms and runs "Clear Account Data". Keeps the account itself, the login and the theme. */
export default function ClearDataDialog({ onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <Modal size="sm" title="Clear account data?" icon="trash" iconTone="danger" onClose={busy ? () => {} : onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={busy} data-autofocus>Cancel</button>
          <button className="btn btn-danger" onClick={run} disabled={busy}>{busy && <span className="spinner" />}Clear data</button>
        </>
      }>
      <p className="clear-text">This permanently deletes the following from your Monevo account:</p>
      <ul className="clear-list">{ITEMS.map(i => <li key={i}>{i}</li>)}</ul>
      <p className="clear-text">
        <strong>Your account stays.</strong> Your profile, login and theme are not affected, and you can start fresh right away.
        This can&apos;t be undone.
      </p>
      {error && <div className="form-error" role="alert" style={{ marginTop: 12 }}><Icon name="alert" size={16} />{error}</div>}
    </Modal>
  );
}
