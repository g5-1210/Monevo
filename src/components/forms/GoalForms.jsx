import { useCallback } from 'react';
import Modal from '../app/Modal';
import Icon from '../app/Icon';
import { TextField, TextAreaField, parseAmount, isPositive } from '../app/FormFields';
import { useForm } from '../app/useForm';
import { useData, useFormat } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { goalStats } from '../../utils/finance';
import { todayISO } from '../../utils/dates';

export function GoalForm({ goal, onClose }) {
  const { actions } = useData();
  const toast = useToast();
  const { symbol } = useFormat();
  const isEdit = Boolean(goal);

  const validate = useCallback((v) => {
    const e = {};
    if (!v.name.trim()) e.name = 'Name your goal.';
    if (!v.target) e.target = 'Set a target amount.';
    else if (!isPositive(v.target)) e.target = 'Target must be greater than zero.';
    if (v.saved !== '' && (!Number.isFinite(parseAmount(v.saved)) || parseAmount(v.saved) < 0)) e.saved = 'Enter 0 or more.';
    else if (isPositive(v.target) && parseAmount(v.saved || 0) > parseAmount(v.target)) e.saved = "Can't be more than the target.";
    if (!v.deadline) e.deadline = 'Pick a target date.';
    else if (!isEdit && v.deadline <= todayISO()) e.deadline = 'Choose a date in the future.';
    return e;
  }, [isEdit]);

  const form = useForm({
    name: goal?.name ?? '', target: goal ? String(goal.target) : '', saved: goal ? String(goal.saved) : '0',
    deadline: goal?.deadline ?? '', description: goal?.description ?? '',
  }, validate);

  const submit = form.handleSubmit((v) => {
    const target = parseAmount(v.target);
    const saved = parseAmount(v.saved || 0);
    const data = { name: v.name.trim(), target, saved, deadline: v.deadline, description: v.description.trim() };
    if (isEdit) actions.updateGoal(goal.id, { ...data, completedAt: saved >= target ? (goal.completedAt ?? todayISO()) : undefined });
    else actions.addGoal({ ...data, completedAt: saved >= target ? todayISO() : undefined });
    toast.success(isEdit ? 'Goal updated.' : 'Goal created. Good luck!');
    onClose();
  });

  return (
    <Modal
      title={isEdit ? 'Edit goal' : 'Create goal'} subtitle="Plan for something that matters to you." onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="goal-form" className="btn btn-primary" disabled={form.saving}>
            {form.saving && <span className="spinner" />}{isEdit ? 'Save changes' : 'Create goal'}
          </button>
        </>
      }
    >
      <form id="goal-form" onSubmit={submit} noValidate className="form-stack">
        {form.formError && <div className="form-error" role="alert"><Icon name="alert" size={16} />{form.formError}</div>}
        <TextField id="goal-name" label="Goal name" required placeholder="e.g. Emergency fund" data-autofocus autoComplete="off" {...form.field('name')} />
        <div className="form-grid">
          <TextField id="goal-target" label="Target amount" required prefix={symbol} inputMode="decimal" placeholder="0" autoComplete="off" {...form.field('target')} />
          <TextField id="goal-saved" label="Already saved" prefix={symbol} inputMode="decimal" placeholder="0" autoComplete="off" {...form.field('saved')} />
          <div className="span-2"><TextField id="goal-date" label="Target date" required type="date" {...form.field('deadline')} /></div>
        </div>
        <TextAreaField id="goal-desc" label="Description" placeholder="Why does this matter?" rows={2} {...form.field('description')} />
      </form>
    </Modal>
  );
}

export function AddMoneyForm({ goal, onClose }) {
  const { actions } = useData();
  const toast = useToast();
  const fmt = useFormat();
  const { remaining } = goalStats(goal);

  const validate = useCallback((v) => {
    const e = {};
    if (!v.amount) e.amount = 'Enter how much to add.';
    else if (!isPositive(v.amount)) e.amount = 'Amount must be greater than zero.';
    else if (parseAmount(v.amount) > remaining) e.amount = `That's more than you need. ${fmt.money(remaining)} left to reach the target.`;
    return e;
  }, [remaining, fmt]);

  const form = useForm({ amount: '' }, validate);

  const submit = form.handleSubmit((v) => {
    const amount = parseAmount(v.amount);
    actions.addToGoal(goal.id, amount);
    toast.success(amount >= remaining ? `${goal.name} is fully funded!` : `${fmt.money(amount)} added to ${goal.name}.`);
    onClose();
  });

  const quick = [1000, 5000, 10000].filter(n => n < remaining);

  return (
    <Modal
      size="sm" title="Add money" subtitle={`${goal.name} · ${fmt.money(remaining)} to go`} onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="addmoney-form" className="btn btn-primary" disabled={form.saving}>
            {form.saving && <span className="spinner" />}Add to goal
          </button>
        </>
      }
    >
      <form id="addmoney-form" onSubmit={submit} noValidate className="form-stack">
        <TextField id="addmoney-amount" label="Amount" required prefix={fmt.symbol} inputMode="decimal" placeholder="0" data-autofocus autoComplete="off" {...form.field('amount')} />
        <div className="chip-row" aria-label="Quick amounts">
          {quick.map(n => (
            <button type="button" key={n} className="chip" onClick={() => form.set('amount', String(n))}>+{fmt.money(n)}</button>
          ))}
          <button type="button" className="chip" onClick={() => form.set('amount', String(Math.round(remaining)))}>Complete goal</button>
        </div>
      </form>
    </Modal>
  );
}
