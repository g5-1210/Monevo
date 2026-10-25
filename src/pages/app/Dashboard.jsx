import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/app/Icon';
import DataBoundary from '../../components/app/DataBoundary';
import StatCard from '../../components/app/StatCard';
import { TransactionListCompact } from '../../components/app/TransactionList';
import { BudgetRow } from '../../components/app/BudgetCard';
import { GoalRow } from '../../components/app/GoalCard';
import { BarChart, DonutChart, Sparkline, TrendChart } from '../../components/app/Charts';
import { DashboardSkeleton } from '../../components/app/Skeletons';
import { EmptyState, Segmented } from '../../components/app/ui';
import { useData, useFormat } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { categoryById } from '../../data/categories';
import { MONTHS_LONG, daysBetween, nextOccurrence, todayISO, toISO, monthStart } from '../../utils/dates';
import {
  balanceNow, balanceSeries, budgetsWithSpend, categoryBreakdown, groupSeries, inRange, monthToDate, pctChange, periodRange,
} from '../../utils/finance';
import './dashboard.css';

const labelOf = (id) => categoryById(id).label;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

function Dashboard() {
  const { user, transactions, budgets, goals, recurring, openingBalance } = useData();
  const fmt = useFormat();
  const ui = useUI();
  const [chartView, setChartView] = useState('compare');

  const m = useMemo(() => {
    const { curr, prev } = monthToDate(transactions);
    const balance = balanceNow(transactions, openingBalance);
    const startBalance = balance - curr.savings;
    const monthTxns = inRange(transactions, toISO(monthStart(0)), todayISO());
    return {
      curr, prev, balance,
      balanceChange: startBalance > 0 ? (curr.savings / startBalance) * 100 : null,
      history: balanceSeries(transactions, openingBalance, 6),
      series: groupSeries(transactions, { ...periodRange('6m') }),
      breakdown: categoryBreakdown(monthTxns),
      recent: transactions.slice(0, 8),
      budgets: budgetsWithSpend(budgets, transactions).sort((a, b) => b.pct - a.pct),
      goals: goals.filter(g => !g.completedAt),
    };
  }, [transactions, budgets, goals, openingBalance]);

  const attention = useMemo(() => {
    const items = [];
    m.budgets.filter(b => b.state === 'over').forEach(b => items.push({
      tone: 'danger', icon: 'alert', to: '/budgets',
      text: `${labelOf(b.category)} is ${fmt.money(Math.abs(b.remaining))} over budget`,
    }));
    m.budgets.filter(b => b.state === 'warn').forEach(b => items.push({
      tone: 'warning', icon: 'alert', to: '/budgets',
      text: `${labelOf(b.category)} has used ${Math.round(b.pct)}% of its budget`,
    }));
    recurring.filter(r => r.active && r.type === 'expense')
      .map(r => ({ r, d: daysBetween(todayISO(), nextOccurrence(r)) }))
      .filter(x => x.d <= 7).sort((a, b) => a.d - b.d).slice(0, 2)
      .forEach(({ r, d }) => items.push({
        tone: 'primary', icon: 'repeat', to: '/recurring',
        text: `${r.name} · ${fmt.money(r.amount)} due ${d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`}`,
      }));
    return items.slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.budgets, recurring, fmt.currency]);

  const monthName = MONTHS_LONG[new Date().getMonth()];
  const chartMoney = (v, axis) => (axis ? fmt.money(v, { compact: true }) : fmt.money(v));
  const sameDays = 'vs same days last month';

  return (
    <>
      <header className="page-header dash-head">
        <div>
          <h1 className="page-header__title">{greeting()}, {user.name}</h1>
          <p className="page-header__sub">Here&apos;s your financial overview for {monthName}.</p>
        </div>
      </header>

      {/* Summary */}
      <section className="stats-grid" aria-label="Financial summary">
        <StatCard hero title="Total balance" icon="wallet" value={fmt.money(m.balance)}
          change={m.balanceChange} changeLabel="this month">
          <div className="stat__spark"><Sparkline values={m.history} width={150} height={34} color="#fff" /></div>
        </StatCard>
        <StatCard title="Income" icon="arrow-down-left" value={fmt.money(m.curr.income)}
          change={pctChange(m.curr.income, m.prev.income)} changeLabel={sameDays} />
        <StatCard title="Expenses" icon="arrow-up-right" value={fmt.money(m.curr.expense)} invert
          change={pctChange(m.curr.expense, m.prev.expense)} changeLabel={sameDays} />
        <StatCard title="Savings" icon="shield" value={fmt.money(m.curr.savings)}
          change={pctChange(m.curr.savings, m.prev.savings)}
          changeLabel={m.prev.savings > 0 ? sameDays : `${Math.round(m.curr.rate)}% of income saved`} />
      </section>

      {/* Needs attention */}
      {attention.length > 0 && (
        <section className="attention" aria-label="Needs attention">
          <h2 className="attention__title">Needs attention</h2>
          <ul className="attention__list">
            {attention.map(a => (
              <li key={a.text}>
                <Link to={a.to} className={`attention__item attention__item--${a.tone}`}>
                  <Icon name={a.icon} size={16} /><span>{a.text}</span><Icon name="chevron-right" size={15} className="attention__chev" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Quick actions */}
      <section className="quick" aria-label="Quick actions">
        {[
          { label: 'Add expense', icon: 'arrow-up-right', run: () => ui.openTransaction({ defaultType: 'expense' }), primary: true },
          { label: 'Add income', icon: 'arrow-down-left', run: () => ui.openTransaction({ defaultType: 'income' }) },
          { label: 'Create budget', icon: 'pie', run: () => ui.openBudget() },
          { label: 'Add savings goal', icon: 'target', run: () => ui.openGoal() },
        ].map(q => (
          <button key={q.label} className={`quick__btn${q.primary ? ' quick__btn--primary' : ''}`} onClick={q.run}>
            <span className="quick__icon"><Icon name={q.icon} size={17} /></span>{q.label}
          </button>
        ))}
      </section>

      {/* Spending overview + breakdown */}
      <div className="dash-grid">
        <section className="card dash-grid__wide" aria-labelledby="overview-title">
          <div className="card__head">
            <div>
              <h2 className="card__title" id="overview-title">Spending overview</h2>
              <p className="card__sub">Last 6 months</p>
            </div>
            <Segmented label="Chart view" value={chartView} onChange={setChartView} options={[
              { value: 'compare', label: 'Income vs expenses' }, { value: 'trend', label: 'Spending trend' },
            ]} />
          </div>
          <div className="card__body">
            {chartView === 'compare' ? (
              <BarChart data={m.series} format={chartMoney} height={250} series={[
                { key: 'income', label: 'Income', color: 'var(--primary)' },
                { key: 'expense', label: 'Expenses', color: '#94A3B8' },
              ]} />
            ) : (
              <TrendChart data={m.series} format={chartMoney} height={250} series={[
                { key: 'expense', label: 'Expenses', color: 'var(--primary)', area: true },
              ]} />
            )}
            <div className="legend" style={{ marginTop: 12 }}>
              {chartView === 'compare' ? (
                <>
                  <span className="legend__item"><i className="legend__swatch" style={{ background: 'var(--primary)' }} />Income</span>
                  <span className="legend__item"><i className="legend__swatch" style={{ background: '#94A3B8' }} />Expenses</span>
                </>
              ) : <span className="legend__item"><i className="legend__swatch" style={{ background: 'var(--primary)' }} />Monthly expenses</span>}
            </div>
          </div>
        </section>

        <section className="card" aria-labelledby="breakdown-title">
          <div className="card__head">
            <div>
              <h2 className="card__title" id="breakdown-title">Expense breakdown</h2>
              <p className="card__sub">{monthName} so far</p>
            </div>
          </div>
          <div className="card__body">
            {m.breakdown.length === 0 ? (
              <EmptyState compact icon="pie" title="No spending yet" text="Expenses you add this month will be grouped by category here." />
            ) : (
              <div className="breakdown">
                <DonutChart slices={m.breakdown} centerLabel="Spent" centerValue={fmt.money(m.curr.expense)} />
                <ul className="breakdown__list">
                  {m.breakdown.slice(0, 6).map(c => (
                    <li key={c.id}>
                      <span className="breakdown__dot" style={{ background: c.color }} />
                      <span className="breakdown__name">{c.label}</span>
                      <span className="breakdown__pct tabular">{Math.round(c.pct)}%</span>
                      <span className="breakdown__amt tabular">{fmt.money(c.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Transactions + budgets + goals */}
      <div className="dash-grid">
        <section className="card dash-grid__wide" aria-labelledby="recent-title">
          <div className="card__head">
            <div>
              <h2 className="card__title" id="recent-title">Recent transactions</h2>
              <p className="card__sub">Your latest activity</p>
            </div>
            <Link to="/transactions" className="card__link">View all transactions <Icon name="arrow-right" size={14} /></Link>
          </div>
          <div className="card__body card__body--flush">
            {m.recent.length === 0 ? (
              <EmptyState icon="transactions" title="No transactions yet" text="Add your first expense or income to start tracking."
                action={<button className="btn btn-primary" onClick={() => ui.openTransaction()}>Add transaction</button>} />
            ) : <TransactionListCompact items={m.recent} />}
          </div>
        </section>

        <div className="dash-stack">
          <section className="card" aria-labelledby="budgets-title">
            <div className="card__head">
              <div><h2 className="card__title" id="budgets-title">Budget overview</h2><p className="card__sub">{monthName}</p></div>
              <Link to="/budgets" className="card__link">Manage</Link>
            </div>
            <div className="card__body dash-list">
              {m.budgets.length === 0 ? (
                <EmptyState compact icon="pie" title="No budgets yet" text="Set a limit for a category to stay on track."
                  action={<button className="btn btn-primary btn-sm" onClick={() => ui.openBudget()}>Create budget</button>} />
              ) : m.budgets.slice(0, 4).map(b => <BudgetRow key={b.id} budget={b} />)}
            </div>
          </section>

          <section className="card" aria-labelledby="goals-title">
            <div className="card__head">
              <div><h2 className="card__title" id="goals-title">Savings goals</h2><p className="card__sub">{m.goals.length} active</p></div>
              <Link to="/goals" className="card__link">View all</Link>
            </div>
            <div className="card__body dash-list">
              {m.goals.length === 0 ? (
                <EmptyState compact icon="target" title="No savings goals yet" text="Start planning for something important."
                  action={<button className="btn btn-primary btn-sm" onClick={() => ui.openGoal()}>Create your first goal</button>} />
              ) : m.goals.slice(0, 3).map(g => <GoalRow key={g.id} goal={g} />)}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}


export default function DashboardPage() {
  return (
    <DataBoundary skeleton={<DashboardSkeleton />}>
      <Dashboard />
    </DataBoundary>
  );
}
