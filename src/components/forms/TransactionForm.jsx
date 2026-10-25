import { useCallback } from 'react';
import Modal from '../app/Modal';
import Icon from '../app/Icon';
import { TextField, SelectField, TextAreaField, ChoiceGroup, parseAmount, isPositive } from '../app/FormFields';
import { useForm } from '../app/useForm';
import { useData, useFormat } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES, PAYMENT_METHODS } from '../../data/categories';
import { todayISO } from '../../utils/dates';

const validate = (v) => {
  const e = {};
  if (!v.title.trim()) e.title = 'Give this transaction a name.';
  if (!v.amount) e.amount = 'Enter an amount.';
  else if (!isPositive(v.amount)) e.amount = 'Amount must be greater than zero.';
  if (!v.category) e.category = 'Choose a category.';
  if (!v.date) e.date = 'Pick a date.';
  return e;
};

export default function TransactionForm({ transaction, defaultType = 'expense', onClose }) {
  const { actions } = useData();
  const toast = useToast();
  const { symbol } = useFormat();
  const isEdit = Boolean(transaction);

  const form = useForm({
    type: transaction?.type ?? defaultType,
    title: transaction?.title ?? '',
    amount: transaction ? String(transaction.amount) : '',
    category: transaction?.category ?? '',
    date: transaction?.date ?? todayISO(),
    method: transaction?.method ?? 'UPI',
    notes: transaction?.notes ?? '',
  }, useCallback(validate, []));

  const { values, set } = form;
  const categories = CATEGORIES.filter(c => c.type === values.type);

  const changeType = (type) => {
    set('type', type);
    if (!CATEGORIES.some(c => c.id === values.category && c.type === type)) set('category', '');
  };

  const submit = form.handleSubmit((v) => {
    const data = { type: v.type, title: v.title.trim(), amount: parseAmount(v.amount), category: v.category, date: v.date, method: v.method, notes: v.notes.trim() };
    if (isEdit) actions.updateTransaction(transaction.id, data);
    else actions.addTransaction(data);
    toast.success(isEdit ? 'Transaction updated.' : `${v.type === 'income' ? 'Income' : 'Expense'} added.`);
    onClose();
  });

  return (
    <Modal
      title={isEdit ? 'Edit transaction' : 'Add transaction'}
      subtitle={isEdit ? 'Update the details below.' : 'Record money coming in or going out.'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="txn-form" className="btn btn-primary" disabled={form.saving}>
            {form.saving && <span className="spinner" />}{isEdit ? 'Save changes' : 'Add transaction'}
          </button>
        </>
      }
    >
      <form id="txn-form" onSubmit={submit} noValidate className="form-stack">
        {form.formError && <div className="form-error" role="alert"><Icon name="alert" size={16} />{form.formError}</div>}
        <ChoiceGroup label="Transaction type" value={values.type} onChange={changeType} options={[
          { value: 'expense', label: 'Expense', icon: 'arrow-up-right', tone: 'expense' },
          { value: 'income',  label: 'Income',  icon: 'arrow-down-left', tone: 'income' },
        ]} />
        <TextField id="txn-title" label="Title" required placeholder="e.g. Grocery run" data-autofocus autoComplete="off" {...form.field('title')} />
        <div className="form-grid">
          <TextField id="txn-amount" label="Amount" required prefix={symbol} inputMode="decimal" placeholder="0" autoComplete="off" {...form.field('amount')} />
          <TextField id="txn-date" label="Date" required type="date" {...form.field('date')} />
          <SelectField id="txn-category" label="Category" required placeholder="Select category"
            options={categories.map(c => ({ value: c.id, label: c.label }))} {...form.field('category')} />
          <SelectField id="txn-method" label="Payment method" required
            options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))} {...form.field('method')} />
        </div>
        <TextAreaField id="txn-notes" label="Notes" placeholder="Anything worth remembering?" rows={2} {...form.field('notes')} />
      </form>
    </Modal>
  );
}
