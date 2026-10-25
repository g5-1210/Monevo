import { useState } from 'react';
import Modal from '../app/Modal';
import Icon from '../app/Icon';

/* Destructive action guarded by typing a confirmation word. */
export default function DeleteAccountDialog({ onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ok = text.trim().toUpperCase() === 'DELETE';

  const run = async () => {
    if (busy || !ok) return;
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
    <Modal size="sm" title="Delete your account?" icon="trash" iconTone="danger" onClose={busy ? () => {} : onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-danger" disabled={!ok || busy} onClick={run}>{busy && <span className="spinner" />}Delete account</button>
        </>
      }>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
        This permanently deletes your login, profile and all your Monevo data. This can&apos;t be undone.
        To keep your account and only remove your finance records, use <strong>Clear account data</strong> instead.
      </p>
      <div className="field">
        <label className="field__label" htmlFor="delete-confirm">Type <strong>DELETE</strong> to confirm</label>
        <input id="delete-confirm" className="field__input" value={text} onChange={e => setText(e.target.value)} autoComplete="off" data-autofocus />
      </div>
      {error && <div className="form-error" role="alert" style={{ marginTop: 12 }}><Icon name="alert" size={16} />{error}</div>}
    </Modal>
  );
}
