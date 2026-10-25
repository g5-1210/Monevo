import { useCallback } from 'react';
import Modal from '../app/Modal';
import Icon from '../app/Icon';
import { TextField, SelectField, ChoiceGroup, parseAmount, isPositive } from '../app/FormFields';
import { Switch } from '../app/ui';
import { useForm } from '../app/useForm';
import { useData, useFormat } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../data/categories';
import { nextOccurrence, parseISO, todayISO } from '../../utils/dates';

const validate = (v) => {
  const e = {};
  if (!v.name.trim()) e.name = 'Give this payment a name.';
  if (!v.amount) e.amount = 'Enter an amount.';
  else if (!isPositive(v.amount)) e.amount = 'Amount must be greater than zero.';
  if (!v.category) e.category = 'Choose a category.';
  if (!v.date) e.date = 'Pick the next payment date.';
  return e;
};

export const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }, { value: 'yearly', label: 'Yearly' },
];

export default function RecurringForm({ item, onClose }) {
  const { actions } = useData();
  const toast = useToast();
  const { symbol } = useFormat();
  const isEdit = Boolean(item);

  const form = useForm({
    type: item?.type ?? 'expense',
    kind: item?.kind ?? 'subscription',
    name: item?.name ?? '',
    amount: item ? String(item.amount) : '',
    frequency: item?.frequency ?? 'monthly',
    date: item ? nextOccurrence(item) : todayISO(),
    category: item?.category ?? '',
    active: item?.active ?? true,
  }, useCallback(validate, []));
  const { values, set } = form;

  const changeType = (type) => {
    set('type', type);
    set('kind', type === 'income' ? 'income' : 'subscription');
    if (!CATEGORIES.some(c => c.id === values.category && c.type === type)) set('category', '');
  };

  const submit = form.handleSubmit((v) => {
    const d = parseISO(v.date);
    const data = {
      type: v.type, kind: v.kind, name: v.name.trim(), amount: parseAmount(v.amount), frequency: v.frequency,
      day: d.getDate(), weekday: d.getDay(), month: d.getMonth(), category: v.category, active: v.active,
    };
    if (isEdit) actions.updateRecurring(item.id, data);
    else actions.addRecurring(data);
    toast.success(isEdit ? 'Recurring payment updated.' : 'Recurring payment added.');
    onClose();
  });

  return (
    <Modal
      title={isEdit ? 'Edit recurring payment' : 'Add recurring payment'}
      subtitle="Subscriptions, bills and regular income." onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="recurring-form" className="btn btn-primary" disabled={form.saving}>
            {form.saving && <span className="spinner" />}{isEdit ? 'Save changes' : 'Add payment'}
          </button>
        </>
      }
    >
      <form id="recurring-form" onSubmit={submit} noValidate className="form-stack">
        {form.formError && <div className="form-error" role="alert"><Icon name="alert" size={16} />{form.formError}</div>}
        <ChoiceGroup label="Payment type" value={values.type} onChange={changeType} options={[
          { value: 'expense', label: 'Expense', icon: 'arrow-up-right', tone: 'expense' },
          { value: 'income',  label: 'Income',  icon: 'arrow-down-left', tone: 'income' },
        ]} />
        <TextField id="rec-name" label="Name" required placeholder="e.g. Netflix" data-autofocus autoComplete="off" {...form.field('name')} />
        <div className="form-grid">
          <TextField id="rec-amount" label="Amount" required prefix={symbol} inputMode="decimal" placeholder="0" autoComplete="off" {...form.field('amount')} />
          <SelectField id="rec-frequency" label="Frequency" required options={FREQUENCIES} {...form.field('frequency')} />
          <SelectField id="rec-category" label="Category" required placeholder="Select category"
            options={CATEGORIES.filter(c => c.type === values.type).map(c => ({ value: c.id, label: c.label }))} {...form.field('category')} />
          <TextField id="rec-date" label="Next payment" required type="date" {...form.field('date')} />
        </div>
        {values.type === 'expense' && (
          <SelectField id="rec-kind" label="Type of payment" required options={[
            { value: 'subscription', label: 'Subscription' }, { value: 'bill', label: 'Bill' }, { value: 'expense', label: 'Other recurring expense' },
          ]} {...form.field('kind')} />
        )}
        <div className="switch-row">
          <div><strong>Active</strong><p className="field__hint">Paused payments stay on file but aren't counted.</p></div>
          <Switch checked={values.active} onChange={(v) => set('active', v)} label="Active" />
        </div>
      </form>
    </Modal>
  );
}
