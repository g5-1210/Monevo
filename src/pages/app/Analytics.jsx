import { useMemo, useState } from 'react';
import Icon from '../../components/app/Icon';
import DataBoundary from '../../components/app/DataBoundary';
import StatCard from '../../components/app/StatCard';
import { BarChart, TrendChart } from '../../components/app/Charts';
import { PageHeader, EmptyState, ProgressBar } from '../../components/app/ui';
import { CardSkeleton, PageHeaderSkeleton, StatsSkeleton } from '../../components/app/Skeletons';
import { useData, useFormat } from '../../context/DataContext';
import {
  PERIODS, buildInsights, categoryBreakdown, groupSeries, inRange, pctChange, periodRange, previousRange, totalsFor,
} from '../../utils/finance';
import './analytics.css';

function Analytics() {
  const { transactions, goals } = useData();
  const fmt = useFormat();
  const [period, setPeriod] = useState('6m');

  const d = useMemo(() => {
    const range = periodRange(period);
    const prevRange = previousRange(range);
    const rows = inRange(transactions, range.from, range.to);
    const prevRows = inRange(transactions, prevRange.from, prevRange.to);
    const prevCats = categoryBreakdown(prevRows);
    return {
      rows, hasPrev: prevRows.length > 0,
      curr: totalsFor(rows), prev: totalsFor(prevRows),
      series: groupSeries(transactions, range),
      cats: categoryBreakdown(rows).map(c => ({ ...c, change: pctChange(c.amount, prevCats.find(p => p.id === c.id)?.amount ?? 0) })),
      range,
    };
  }, [transactions, period]);

  const insights = useMemo(() => buildInsights(transactions, goals, fmt.money), [transactions, goals, fmt]);
  const label = PERIODS.find(p => p.id === period).label.toLowerCase();
  const vs = d.hasPrev ? 'vs previous period' : '';
  const chartMoney = (v, axis) => (axis ? fmt.money(v, { compact: true }) : fmt.money(v));
  const avg = d.series.length ? d.curr.expense / d.series.length : 0;
  const maxCat = d.cats[0]?.amount ?? 1;
  const rateChange = d.hasPrev ? d.curr.rate - d.prev.rate : null;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Understand where your money comes from and where it goes." />

      <div className="period" role="group" aria-label="Time period">
        {PERIODS.map(p => (
          <button key={p.id} className="period__btn" aria-pressed={period === p.id} onClick={() => setPeriod(p.id)}>{p.label}</button>
        ))}
      </div>

      {d.rows.length === 0 ? (
        <div className="card"><EmptyState icon="chart" title="No data for this period" text="Add transactions, or pick a longer period, to see trends here." /></div>
      ) : (
        <>
          <section className="stats-grid stats-grid--even" aria-label="Overview">
            <StatCard title="Total income" icon="arrow-down-left" value={fmt.money(d.curr.income)} change={d.hasPrev ? pctChange(d.curr.income, d.prev.income) : null} changeLabel={vs} />
            <StatCard title="Total expenses" icon="arrow-up-right" invert value={fmt.money(d.curr.expense)} change={d.hasPrev ? pctChange(d.curr.expense, d.prev.expense) : null} changeLabel={vs} />
            <StatCard title="Savings" icon="shield" value={fmt.money(d.curr.savings)} change={d.hasPrev ? pctChange(d.curr.savings, d.prev.savings) : null} changeLabel={vs} />
            <StatCard title="Savings rate" icon="pie" value={`${d.curr.rate.toFixed(1)}%`}
              change={rateChange} changeLabel={rateChange === null ? 'of income saved' : 'pts vs previous'} />
          </section>

          <div className="an-grid">
            <section className="card" aria-labelledby="trend-title">
              <div className="card__head">
                <div><h2 className="card__title" id="trend-title">Spending trend</h2><p className="card__sub">Expenses over {label} · average {fmt.money(avg)} per {d.range.groupBy}</p></div>
              </div>
              <div className="card__body">
                <TrendChart data={d.series} format={chartMoney} height={250}
                  series={[{ key: 'expense', label: 'Expenses', color: 'var(--primary)', area: true }]} />
              </div>
            </section>

            <section className="card" aria-labelledby="ive-title">
              <div className="card__head">
                <div><h2 className="card__title" id="ive-title">Income vs expenses</h2><p className="card__sub">How much came in and went out</p></div>
              </div>
              <div className="card__body">
                <BarChart data={d.series} format={chartMoney} height={250} series={[
                  { key: 'income', label: 'Income', color: 'var(--primary)' },
                  { key: 'expense', label: 'Expenses', color: '#94A3B8' },
                ]} />
                <div className="legend" style={{ marginTop: 12 }}>
                  <span className="legend__item"><i className="legend__swatch" style={{ background: 'var(--primary)' }} />Income</span>
                  <span className="legend__item"><i className="legend__swatch" style={{ background: '#94A3B8' }} />Expenses</span>
                </div>
              </div>
            </section>
          </div>

          <div className="an-grid an-grid--cats">
            <section className="card" aria-labelledby="cat-title">
              <div className="card__head">
                <div><h2 className="card__title" id="cat-title">Where your money goes</h2><p className="card__sub">Spending by category · {label}</p></div>
              </div>
              <div className="card__body">
                {d.cats.length === 0 ? <EmptyState compact icon="pie" title="No expenses" text="Nothing spent in this period." /> : (
                  <ul className="cat-rank">
                    {d.cats.map((c, i) => (
                      <li key={c.id}>
                        <div className="cat-rank__top">
                          <span className="cat-rank__name"><span className="cat-rank__n">{i + 1}</span>{c.label}</span>
                          <span className="cat-rank__amt tabular"><strong>{fmt.money(c.amount)}</strong><em>{Math.round(c.pct)}%</em></span>
                        </div>
                        <div className="cat-rank__bar"><ProgressBar value={(c.amount / maxCat) * 100} size="sm" label={c.label} /></div>
                        {d.hasPrev && c.change !== null && (
                          <span className={`cat-rank__chg ${c.change > 0 ? 'is-up' : 'is-down'}`}>
                            <Icon name={c.change > 0 ? 'trending-up' : 'trending-down'} size={12} strokeWidth={2.3} />{Math.abs(Math.round(c.change))}%
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="card" aria-labelledby="ins-title">
              <div className="card__head">
                <div><h2 className="card__title" id="ins-title">Insights</h2><p className="card__sub">Calculated from your transactions this month</p></div>
              </div>
              <div className="card__body">
                {insights.length === 0 ? <EmptyState compact icon="lightbulb" title="Not enough data yet" text="Keep adding transactions and insights will show up here." /> : (
                  <ul className="insights">
                    {insights.map(i => (
                      <li key={i.title} className={`insight insight--${i.tone}`}>
                        <span className="insight__icon"><Icon name={i.icon} size={16} /></span>
                        <div><strong>{i.title}</strong><p>{i.body}</p></div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}

export default function AnalyticsPage() {
  return (
    <DataBoundary skeleton={<><PageHeaderSkeleton /><StatsSkeleton /><CardSkeleton height={250} /></>}>
      <Analytics />
    </DataBoundary>
  );
}
