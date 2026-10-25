import { useCallback } from 'react';
import Modal from '../app/Modal';
import Icon from '../app/Icon';
import { TextField, SelectField, parseAmount, isPositive } from '../app/FormFields';
import { useForm } from '../app/useForm';
import { useData, useFormat } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { EXPENSE_CATEGORIES } from '../../data/categories';
import { monthStart, toISO } from '../../utils/dates';

const validate = (v) => {
  const e = {};
  if (!v.category) e.category = 'Choose a category.';
  if (!v.limit) e.limit = 'Set a monthly limit.';
  else if (!isPositive(v.limit)) e.limit = 'Limit must be greater than zero.';
  if (!v.startDate) e.startDate = 'Pick a start date.';
  return e;
};

const THRESHOLDS = [
  { value: '', label: 'No alert' },
  ...[50, 60, 70, 80, 90].map(n => ({ value: String(n), label: `Alert me at ${n}%` })),
];

export default function BudgetForm({ budget, onClose }) {
  const { budgets, actions } = useData();
  const toast = useToast();
  const { symbol } = useFormat();
  const isEdit = Boolean(budget);

  const taken = new Set(budgets.filter(b => b.id !== budget?.id).map(b => b.category));
  const available = EXPENSE_CATEGORIES.filter(c => !taken.has(c.id));

  const form = useForm({
    category: budget?.category ?? '',
    limit: budget ? String(budget.limit) : '',
    startDate: budget?.startDate ?? toISO(monthStart(0)),
    alertThreshold: budget?.alertThreshold != null ? String(budget.alertThreshold) : '80',
  }, useCallback(validate, []));

  const submit = form.handleSubmit((v) => {
    const data = {
      category: v.category, limit: parseAmount(v.limit), startDate: v.startDate,
      alertThreshold: v.alertThreshold ? Number(v.alertThreshold) : null,
    };
    if (isEdit) actions.updateBudget(budget.id, data);
    else actions.addBudget(data);
    toast.success(isEdit ? 'Budget updated.' : 'Budget created.');
    onClose();
  });

  return (
    <Modal
      title={isEdit ? 'Edit budget' : 'Create budget'}
      subtitle="Set a monthly limit for one category."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="budget-form" className="btn btn-primary" disabled={form.saving || (!isEdit && available.length === 0)}>
            {form.saving && <span className="spinner" />}{isEdit ? 'Save changes' : 'Create budget'}
          </button>
        </>
      }
    >
      <form id="budget-form" onSubmit={submit} noValidate className="form-stack">
        {form.formError && <div className="form-error" role="alert"><Icon name="alert" size={16} />{form.formError}</div>}
        {!isEdit && available.length === 0 && (
          <div className="form-error" role="status"><Icon name="info" size={16} />Every category already has a budget. Edit an existing one instead.</div>
        )}
        <SelectField id="budget-category" label="Category" required placeholder="Select category" data-autofocus
          options={(isEdit ? EXPENSE_CATEGORIES.filter(c => !taken.has(c.id)) : available).map(c => ({ value: c.id, label: c.label }))}
          {...form.field('category')} />
        <div className="form-grid">
          <TextField id="budget-limit" label="Monthly limit" required prefix={symbol} inputMode="decimal" placeholder="0" autoComplete="off" {...form.field('limit')} />
          <TextField id="budget-start" label="Start date" required type="date" {...form.field('startDate')} />
        </div>
        <SelectField id="budget-alert" label="Alert threshold" options={THRESHOLDS}
          hint="We'll flag this budget as 'approaching limit' once you pass this point." {...form.field('alertThreshold')} />
      </form>
    </Modal>
  );
}
