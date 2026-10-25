import { useMemo, useState } from 'react';
import Icon from '../../components/app/Icon';
import DataBoundary from '../../components/app/DataBoundary';
import { PageHeader, EmptyState, Segmented } from '../../components/app/ui';
import { SelectField } from '../../components/app/FormFields';
import { TransactionTable } from '../../components/app/TransactionList';
import { ListSkeleton, PageHeaderSkeleton } from '../../components/app/Skeletons';
import { useData, useFormat } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES, categoryById } from '../../data/categories';
import { periodRange, sumAmount } from '../../utils/finance';
import './transactions.css';

const PAGE_SIZE = 12;
const DEFAULTS = { q: '', range: 'all', from: '', to: '', category: 'all', type: 'all', sort: 'newest' };

const RANGES = [
  { value: 'all', label: 'All time' }, { value: 'this-month', label: 'This month' }, { value: 'last-month', label: 'Last month' },
  { value: '3m', label: 'Last 3 months' }, { value: 'year', label: 'This year' }, { value: 'custom', label: 'Custom range' },
];
const SORTS = [
  { value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' }, { value: 'lowest', label: 'Lowest amount' },
];

function Transactions() {
  const { transactions, actions } = useData();
  const fmt = useFormat();
  const ui = useUI();
  const toast = useToast();
  const [f, setF] = useState(DEFAULTS);
  const [page, setPage] = useState(1);

  const set = (patch) => { setF(prev => ({ ...prev, ...patch })); setPage(1); };
  const dirty = JSON.stringify(f) !== JSON.stringify(DEFAULTS);

  const filtered = useMemo(() => {
    let from = '', to = '';
    if (f.range === 'custom') { from = f.from; to = f.to; }
    else if (f.range !== 'all') { ({ from, to } = periodRange(f.range)); }
    const q = f.q.trim().toLowerCase();
    const rows = transactions.filter(t =>
      (!q || t.title.toLowerCase().includes(q) || categoryById(t.category).label.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)) &&
      (f.type === 'all' || t.type === f.type) &&
      (f.category === 'all' || t.category === f.category) &&
      (!from || t.date >= from) && (!to || t.date <= to));
    const cmp = {
      newest: (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
      oldest: (a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0),
      highest: (a, b) => b.amount - a.amount,
      lowest: (a, b) => a.amount - b.amount,
    }[f.sort];
    return [...rows].sort(cmp);
  }, [transactions, f]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const income = sumAmount(filtered, 'income');
  const expense = sumAmount(filtered, 'expense');

  const onDelete = (t) => ui.confirm({
    title: 'Delete this transaction?', confirmLabel: 'Delete',
    message: `"${t.title}" (${fmt.money(t.amount)}) will be removed from your records. This can't be undone.`,
    onConfirm: () => { actions.deleteTransaction(t.id); toast.success('Transaction deleted.'); },
  });

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Date', 'Title', 'Type', 'Category', 'Payment method', 'Amount', 'Notes'],
      ...filtered.map(t => [t.date, t.title, t.type, categoryById(t.category).label, t.method, t.amount, t.notes])];
    const blob = new Blob([rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'monevo-transactions.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${filtered.length} transactions.`);
  };

  const hasAny = transactions.length > 0;

  return (
    <>
      <PageHeader title="Transactions" subtitle="Track and manage your income and expenses.">
        {hasAny && <button className="btn btn-secondary" onClick={exportCsv} disabled={!filtered.length}><Icon name="download" size={16} />Export</button>}
        <button className="btn btn-primary" onClick={() => ui.openTransaction()}><Icon name="plus" size={16} strokeWidth={2.3} />Add transaction</button>
      </PageHeader>

      {!hasAny ? (
        <div className="card">
          <EmptyState icon="transactions" title="No transactions yet"
            text="Record your first expense or income and Monevo will start building your picture."
            action={<button className="btn btn-primary" onClick={() => ui.openTransaction()}>Add your first transaction</button>} />
        </div>
      ) : (
        <>
          <section className="filters card" aria-label="Filters">
            <div className="filters__search">
              <Icon name="search" size={17} />
              <input type="search" className="field__input" placeholder="Search by name, category or note"
                value={f.q} onChange={e => set({ q: e.target.value })} aria-label="Search transactions" />
            </div>
            <div className="filters__row">
              <div className="filters__type">
                <Segmented label="Type" value={f.type} onChange={(v) => set({ type: v })} options={[
                  { value: 'all', label: 'All' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' },
                ]} />
              </div>
              <SelectField id="f-range" label="Date" options={RANGES} value={f.range} onChange={e => set({ range: e.target.value })} required />
              <SelectField id="f-category" label="Category" required value={f.category} onChange={e => set({ category: e.target.value })}
                options={[{ value: 'all', label: 'All categories' }, ...CATEGORIES.map(c => ({ value: c.id, label: c.label }))]} />
              <SelectField id="f-sort" label="Sort by" options={SORTS} value={f.sort} onChange={e => set({ sort: e.target.value })} required />
              {dirty && <button className="btn btn-ghost btn-sm filters__clear" onClick={() => set(DEFAULTS)}><Icon name="x" size={14} />Clear filters</button>}
            </div>
            {f.range === 'custom' && (
              <div className="filters__custom">
                <label>From<input type="date" className="field__input" value={f.from} max={f.to || undefined} onChange={e => set({ from: e.target.value })} /></label>
                <label>To<input type="date" className="field__input" value={f.to} min={f.from || undefined} onChange={e => set({ to: e.target.value })} /></label>
              </div>
            )}
          </section>

          <div className="results-bar" aria-live="polite">
            <p><strong>{filtered.length}</strong> {filtered.length === 1 ? 'transaction' : 'transactions'}</p>
            <p className="results-bar__sums">
              <span className="amt--income tabular">+{fmt.money(income)}</span>
              <span className="tabular">−{fmt.money(expense)}</span>
            </p>
          </div>

          <section className="card" aria-label="Transaction list">
            {filtered.length === 0 ? (
              <EmptyState icon="search" title="No matching transactions" text="Try a different search or loosen your filters."
                action={<button className="btn btn-secondary" onClick={() => set(DEFAULTS)}>Clear filters</button>} />
            ) : (
              <>
                <TransactionTable items={visible} onEdit={(t) => ui.openTransaction({ transaction: t })} onDelete={onDelete} />
                {pages > 1 && (
                  <nav className="pager" aria-label="Pagination">
                    <p>Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                    <div className="pager__btns">
                      <button className="btn btn-secondary btn-sm" disabled={current === 1} onClick={() => setPage(current - 1)}><Icon name="chevron-left" size={15} />Previous</button>
                      <span className="pager__page">{current} / {pages}</span>
                      <button className="btn btn-secondary btn-sm" disabled={current === pages} onClick={() => setPage(current + 1)}>Next<Icon name="chevron-right" size={15} /></button>
                    </div>
                  </nav>
                )}
              </>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default function TransactionsPage() {
  return (
    <DataBoundary skeleton={<><PageHeaderSkeleton /><ListSkeleton rows={8} /></>}>
      <Transactions />
    </DataBoundary>
  );
}
