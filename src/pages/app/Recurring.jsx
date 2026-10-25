import { useMemo, useState } from 'react';
import Icon from '../../components/app/Icon';
import DataBoundary from '../../components/app/DataBoundary';
import Dropdown, { DropdownItem } from '../../components/app/Dropdown';
import { PageHeader, EmptyState, Segmented, Switch, Badge, CategoryIcon } from '../../components/app/ui';
import { ListSkeleton, PageHeaderSkeleton, StatsSkeleton } from '../../components/app/Skeletons';
import { useData, useFormat } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';
import { categoryById } from '../../data/categories';
import { daysBetween, nextOccurrence, todayISO } from '../../utils/dates';
import { monthlyEquivalent } from '../../utils/finance';
import './recurring.css';

const FILTERS = [
  { value: 'all', label: 'All' }, { value: 'subscription', label: 'Subscriptions' },
  { value: 'bill', label: 'Bills' }, { value: 'expense', label: 'Expenses' }, { value: 'income', label: 'Income' },
];
const PER = { weekly: 'week', monthly: 'month', quarterly: 'quarter', yearly: 'year' };
const KIND_LABEL = { subscription: 'Subscription', bill: 'Bill', expense: 'Expense', income: 'Income' };

function dueText(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function Recurring() {
  const { recurring, actions } = useData();
  const fmt = useFormat();
  const ui = useUI();
  const toast = useToast();
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => recurring.map(r => {
    const next = nextOccurrence(r);
    return { ...r, next, days: daysBetween(todayISO(), next) };
  }), [recurring]);

  const stats = useMemo(() => {
    const active = rows.filter(r => r.active);
    return {
      out: active.filter(r => r.type === 'expense').reduce((s, r) => s + monthlyEquivalent(r), 0),
      in: active.filter(r => r.type === 'income').reduce((s, r) => s + monthlyEquivalent(r), 0),
      soon: active.filter(r => r.type === 'expense' && r.days <= 7),
      subs: active.filter(r => r.kind === 'subscription').length,
    };
  }, [rows]);

  const visible = rows
    .filter(r => filter === 'all' || r.kind === filter)
    .sort((a, b) => Number(b.active) - Number(a.active) || a.days - b.days);

  const toggle = (r, active) => {
    actions.updateRecurring(r.id, { active });
    toast.success(active ? `${r.name} resumed.` : `${r.name} paused.`);
  };
  const onDelete = (r) => ui.confirm({
    title: 'Delete recurring payment?', confirmLabel: 'Delete',
    message: `"${r.name}" will no longer appear in your upcoming payments. Past transactions are kept.`,
    onConfirm: () => { actions.deleteRecurring(r.id); toast.success('Recurring payment deleted.'); },
  });

  return (
    <>
      <PageHeader title="Recurring payments" subtitle="Subscriptions, bills and regular income in one place.">
        <button className="btn btn-primary" onClick={() => ui.openRecurring()}><Icon name="plus" size={16} strokeWidth={2.3} />Add recurring payment</button>
      </PageHeader>

      {recurring.length === 0 ? (
        <div className="card">
          <EmptyState icon="repeat" title="No recurring payments yet"
            text="Add subscriptions, rent or your salary so you always know what's coming up."
            action={<button className="btn btn-primary" onClick={() => ui.openRecurring()}>Add your first one</button>} />
        </div>
      ) : (
        <>
          <section className="stats-grid stats-grid--even" aria-label="Recurring summary">
            <article className="stat"><span className="stat__title">Monthly commitments</span><p className="stat__value tabular">{fmt.money(stats.out)}</p><p className="stat__vs">Active payments, per month</p></article>
            <article className="stat"><span className="stat__title">Recurring income</span><p className="stat__value tabular">{fmt.money(stats.in)}</p><p className="stat__vs">Per month</p></article>
            <article className="stat"><span className="stat__title">Due in 7 days</span><p className="stat__value tabular">{fmt.money(stats.soon.reduce((s, r) => s + r.amount, 0))}</p><p className="stat__vs">{stats.soon.length} {stats.soon.length === 1 ? 'payment' : 'payments'}</p></article>
            <article className="stat"><span className="stat__title">Subscriptions</span><p className="stat__value tabular">{stats.subs}</p><p className="stat__vs">Active</p></article>
          </section>

          <div className="rec-filter"><Segmented label="Filter" value={filter} onChange={setFilter} options={FILTERS} /></div>

          <section className="card" aria-label="Recurring payments list">
            {visible.length === 0 ? (
              <EmptyState compact icon="repeat" title="Nothing here" text="No recurring payments in this category yet." />
            ) : (
              <ul className="rec-list">
                {visible.map(r => (
                  <li key={r.id} className={`rec-row${r.active ? '' : ' is-paused'}`}>
                    <CategoryIcon category={r.category} />
                    <div className="rec-row__main">
                      <p className="rec-row__name">{r.name}</p>
                      <p className="rec-row__meta">{KIND_LABEL[r.kind]} · {categoryById(r.category).label}</p>
                    </div>
                    <div className="rec-row__amount">
                      <p className={`tabular${r.type === 'income' ? ' amt--income' : ''}`}>{r.type === 'income' ? '+' : ''}{fmt.money(r.amount)} <span>/ {PER[r.frequency]}</span></p>
                    </div>
                    <div className="rec-row__next">
                      {r.active ? (
                        <>
                          <p>{r.type === 'income' ? 'Next income' : 'Next payment'}: <strong>{fmt.day(r.next)}</strong></p>
                          {r.days <= 7 ? <Badge tone={r.type === 'income' ? 'success' : 'warning'}>{dueText(r.days)}</Badge> : <span className="rec-row__in">{dueText(r.days)}</span>}
                        </>
                      ) : <Badge>Paused</Badge>}
                    </div>
                    <div className="rec-row__controls">
                      <Switch checked={r.active} onChange={(v) => toggle(r, v)} label={`${r.active ? 'Pause' : 'Resume'} ${r.name}`} />
                      <Dropdown label={`Actions for ${r.name}`} trigger={({ open, toggle: tg }) => (
                        <button className="btn btn-icon" onClick={tg} aria-expanded={open} aria-haspopup="menu" aria-label={`Actions for ${r.name}`}><Icon name="dots" size={18} /></button>
                      )}>
                        <DropdownItem icon={<Icon name="edit" size={16} />} onClick={() => ui.openRecurring({ item: recurring.find(x => x.id === r.id) })}>Edit</DropdownItem>
                        <DropdownItem danger icon={<Icon name="trash" size={16} />} onClick={() => onDelete(r)}>Delete</DropdownItem>
                      </Dropdown>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default function RecurringPage() {
  return (
    <DataBoundary skeleton={<><PageHeaderSkeleton /><StatsSkeleton /><ListSkeleton rows={6} /></>}>
      <Recurring />
    </DataBoundary>
  );
}
