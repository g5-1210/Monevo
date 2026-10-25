import { useCallback, useMemo, useRef, useState } from 'react';

/* Tiny form helper: values, per-field errors (shown after blur or submit),
   and a submit handler that simulates a short network round-trip. */
export function useForm(initial, validate) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const initialRef = useRef(initial);

  const errors = useMemo(() => validate(values), [values, validate]);
  const show = (k) => ((submitted || touched[k]) ? errors[k] : undefined);

  const set = useCallback((k, v) => setValues(prev => ({ ...prev, [k]: v })), []);

  const field = (k) => ({
    value: values[k] ?? '',
    onChange: (e) => set(k, e.target.value),
    onBlur: () => setTouched(t => ({ ...t, [k]: true })),
    error: show(k),
    valid: touched[k] && !errors[k] && values[k] !== '' ? true : undefined,
  });

  const handleSubmit = (onValid) => async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (Object.keys(errors).length) {
      document.querySelector('.modal [aria-invalid="true"]')?.focus();
      return;
    }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 450)); // placeholder for the API call
      await onValid(values);
      setSaving(false);
    } catch (err) {
      setFormError(err?.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const reset = useCallback(() => {
    setValues(initialRef.current); setTouched({}); setSubmitted(false); setFormError('');
  }, []);

  return { values, set, field, errors, handleSubmit, saving, formError, reset };
}
