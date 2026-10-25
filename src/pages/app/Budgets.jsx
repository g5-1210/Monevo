import { useMemo } from 'react';
import Icon from '../../components/app/Icon';
import DataBoundary from '../../components/app/DataBoundary';
import BudgetCard from '../../components/app/BudgetCard';
import { PageHeader, EmptyState, ProgressBar, CategoryIcon } from '../../components/app/ui';
import { GridSkeleton, PageHeaderSkeleton, CardSkeleton } from '../../components/app/Skeletons';
import { useData, useFormat } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';
import { categoryById } from '../../data/categories';
import { MONTHS_LONG } from '../../utils/dates';
import { budgetStatus, budgetsWithSpend, categoryBreakdown, inMonth } from '../../utils/finance';
import './budgets.css';

const ORDER = { over: 0, warn: 1, ok: 2 };

function Budgets() {
  const { budgets, transactions, actions } = useData();
  const fmt = useFormat();
  const ui = useUI();
  const toast = useToast();

  const list = useMemo(
    () => budgetsWithSpend(budgets, transactions).sort((a, b) => ORDER[a.state] - ORDER[b.state] || b.pct - a.pct),
    [budgets, transactions],
  );
  const totals = useMemo(() => {
    const limit = list.reduce((s, b) => s + b.limit, 0);
    const spent = list.reduce((s, b) => s + b.spent, 0);
    const counts = list.reduce((c, b) => ({ ...c, [b.state]: c[b.state] + 1 }), { ok: 0, warn: 0, over: 0 });
    return { limit, spent, counts, ...budgetStatus(spent, limit, 85) };
  }, [list]);

  const unbudgeted = useMemo(() => {
    const covered = new Set(budgets.map(b => b.category));
    return categoryBreakdown(inMonth(transactions, 0)).filter(c => !covered.has(c.id));
  }, [budgets, transactions]);

  const onDelete = (b) => ui.confirm({
    title: 'Delete this budget?', confirmLabel: 'Delete budget',
    message: `The ${categoryById(b.category).label} budget will be removed. Your transactions won't be affected.`,
    onConfirm: () => { actions.deleteBudget(b.id); toast.success('Budget deleted.'); },
  });

  const monthName = MONTHS_LONG[new Date().getMonth()];
  const barTone = totals.state === 'over' ? 'danger' : totals.state === 'warn' ? 'warning' : undefined;

  return (
    <>
      <PageHeader title="Budgets" subtitle={`Stay in control of your spending — ${monthName}.`}>
        <button className="btn btn-primary" onClick={() => ui.openBudget()}><Icon name="plus" size={16} strokeWidth={2.3} />Create budget</button>
      </PageHeader>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState icon="pie" title="No budgets yet"
            text="Set a monthly limit for the categories you want to keep an eye on, and Monevo will track your progress."
            action={<button className="btn btn-primary" onClick={() => ui.openBudget()}>Create your first budget</button>} />
        </div>
      ) : (
        <>
          <section className="card budget-summary" aria-label="Budget summary">
            <div className="budget-summary__main">
              <p className="budget-summary__label">Spent so far</p>
              <p className="budget-summary__value tabular">{fmt.money(totals.spent)}<span> of {fmt.money(totals.limit)}</span></p>
              <ProgressBar value={totals.pct} size="lg" tone={barTone} label="Overall budget used" />
              <p className="budget-summary__foot">
                <span>{Math.round(totals.pct)}% of your monthly budget used</span>
              </p>
            </div>
            <dl className="budget-summary__stats">
              <div><dt>Total budget</dt><dd className="tabular">{fmt.money(totals.limit)}</dd></div>
              <div><dt>Total spent</dt><dd className="tabular">{fmt.money(totals.spent)}</dd></div>
              <div>
                <dt>{totals.remaining < 0 ? 'Over by' : 'Remaining'}</dt>
                <dd className={`tabular${totals.remaining < 0 ? ' is-over' : ''}`}>{fmt.money(Math.abs(totals.remaining))}</dd>
              </div>
            </dl>
            <ul className="budget-summary__status" aria-label="Status of your budgets">
              <li><span className="badge badge--success"><span className="badge__dot" />{totals.counts.ok} on track</span></li>
              <li><span className="badge badge--warning"><span className="badge__dot" />{totals.counts.warn} approaching</span></li>
              <li><span className="badge badge--danger"><span className="badge__dot" />{totals.counts.over} over</span></li>
            </ul>
          </section>

          <h2 className="section-title">Category budgets</h2>
          <div className="card-grid">
            {list.map(b => <BudgetCard key={b.id} budget={b} onEdit={(x) => ui.openBudget({ budget: x })} onDelete={onDelete} />)}
          </div>

          {unbudgeted.length > 0 && (
            <section className="card unbudgeted" aria-label="Spending without a budget">
              <div className="card__head">
                <div>
                  <h2 className="card__title">Spending without a budget</h2>
                  <p className="card__sub">These categories have spending this month but no limit set.</p>
                </div>
              </div>
              <ul className="unbudgeted__list">
                {unbudgeted.map(c => (
                  <li key={c.id}>
                    <CategoryIcon category={c.id} size="sm" />
                    <span className="unbudgeted__name">{c.label}</span>
                    <span className="tabular">{fmt.money(c.amount)}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => ui.openBudget()}>Set a budget</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default function BudgetsPage() {
  return (
    <DataBoundary skeleton={<><PageHeaderSkeleton /><CardSkeleton height={110} title={false} /><div style={{ height: 24 }} /><GridSkeleton count={6} height={110} /></>}>
      <Budgets />
    </DataBoundary>
  );
}
