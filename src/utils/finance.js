/* Pure helpers that turn raw records into the numbers the UI shows.
   Swap the mock data for API data and these keep working unchanged. */
import { MONTHS_SHORT, daysBetween, monthKeyFor, monthStart, parseISO, toISO, todayISO } from './dates.js';
import { CATEGORIES } from '../data/categories.js';

export const sumAmount = (txns, type) =>
  txns.filter(t => !type || t.type === type).reduce((s, t) => s + t.amount, 0);

export function totalsFor(txns) {
  const income = sumAmount(txns, 'income');
  const expense = sumAmount(txns, 'expense');
  const savings = income - expense;
  return { income, expense, savings, rate: income > 0 ? (savings / income) * 100 : 0 };
}

export const inRange = (txns, from, to) => txns.filter(t => t.date >= from && t.date <= to);
export const inMonth = (txns, monthsAgo) => txns.filter(t => t.date.startsWith(monthKeyFor(monthsAgo)));

/** Percent change from `prev` to `curr`. Null when there's nothing to compare. */
export const pctChange = (curr, prev) => (prev > 0 ? ((curr - prev) / prev) * 100 : null);

export const balanceNow = (txns, opening) =>
  opening + sumAmount(txns, 'income') - sumAmount(txns, 'expense');

/** Month-to-date vs the same days last month. */
export function monthToDate(txns) {
  const today = todayISO();
  const dayNum = Number(today.slice(8));
  const thisStart = toISO(monthStart(0));
  const lastStart = toISO(monthStart(1));
  const lastEndDay = Math.min(dayNum, new Date(monthStart(1).getFullYear(), monthStart(1).getMonth() + 1, 0).getDate());
  const lastTo = `${lastStart.slice(0, 8)}${String(lastEndDay).padStart(2, '0')}`;
  return {
    curr: totalsFor(inRange(txns, thisStart, today)),
    prev: totalsFor(inRange(txns, lastStart, lastTo)),
  };
}

export function categoryBreakdown(txns, type = 'expense') {
  const rows = txns.filter(t => t.type === type).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {});
  const total = Object.values(rows).reduce((s, v) => s + v, 0);
  return Object.entries(rows)
    .map(([id, amount]) => {
      const meta = CATEGORIES.find(c => c.id === id);
      return { id, label: meta?.label ?? id, color: meta?.color ?? '#94A3B8', amount, pct: total ? (amount / total) * 100 : 0 };
    })
    .sort((a, b) => b.amount - a.amount);
}

/* ---------- Budgets ---------- */

export function budgetStatus(spent, limit, threshold = 80) {
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const state = pct > 100 ? 'over' : pct >= threshold ? 'warn' : 'ok';
  return { pct, remaining: limit - spent, state };
}

export const BUDGET_STATE = {
  ok:   { label: 'On track',        tone: 'success' },
  warn: { label: 'Approaching limit', tone: 'warning' },
  over: { label: 'Over budget',     tone: 'danger'  },
};

export function budgetsWithSpend(budgets, txns) {
  const month = inMonth(txns, 0).filter(t => t.type === 'expense');
  return budgets.map(b => {
    const spent = month.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0);
    return { ...b, spent, ...budgetStatus(spent, b.limit, b.alertThreshold ?? 101) };
  });
}

/* ---------- Goals ---------- */

export function goalStats(g) {
  const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
  const remaining = Math.max(0, g.target - g.saved);
  const done = g.saved >= g.target;
  const daysLeft = daysBetween(todayISO(), g.deadline);
  const months = Math.max(1, daysLeft / 30);
  return { pct, remaining, done, daysLeft, perMonth: remaining / months, overdue: !done && daysLeft < 0 };
}

/* ---------- Analytics periods ---------- */

export const PERIODS = [
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: '3m',         label: 'Last 3 months' },
  { id: '6m',         label: 'Last 6 months' },
  { id: 'year',       label: 'This year' },
];

function shiftMonth(iso, n) {
  const d = parseISO(iso);
  const day = d.getDate();
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const dim = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  return toISO(new Date(t.getFullYear(), t.getMonth(), Math.min(day, dim)));
}
const endOfMonth = (monthsAgo) => {
  const s = monthStart(monthsAgo);
  return toISO(new Date(s.getFullYear(), s.getMonth() + 1, 0));
};

export function periodRange(id) {
  const today = todayISO();
  switch (id) {
    case 'last-month': return { from: toISO(monthStart(1)), to: endOfMonth(1), months: 1, groupBy: 'week' };
    case '3m':         return { from: toISO(monthStart(2)), to: today, months: 3, groupBy: 'month' };
    case '6m':         return { from: toISO(monthStart(5)), to: today, months: 6, groupBy: 'month' };
    case 'year':       return { from: `${today.slice(0, 4)}-01-01`, to: today, months: 12, groupBy: 'month' };
    default:           return { from: toISO(monthStart(0)), to: today, months: 1, groupBy: 'week' };
  }
}

export function previousRange({ from, to, months }) {
  return { from: shiftMonth(from, -months), to: shiftMonth(to, -months) };
}

/** Buckets transactions into weeks-of-month or calendar months for charts. */
export function groupSeries(txns, { from, to, groupBy }) {
  const rows = inRange(txns, from, to);
  const buckets = [];
  if (groupBy === 'week') {
    const dim = new Date(parseISO(from).getFullYear(), parseISO(from).getMonth() + 1, 0).getDate();
    const lastDay = Math.min(dim, Number(to.slice(8)) || dim);
    const weeks = Math.ceil(lastDay / 7);
    for (let w = 1; w <= weeks; w++) buckets.push({ key: w, label: `Week ${w}`, income: 0, expense: 0 });
    rows.forEach(t => {
      const w = Math.min(weeks, Math.ceil(Number(t.date.slice(8)) / 7));
      buckets[w - 1][t.type] += t.amount;
    });
  } else {
    const start = parseISO(from);
    const end = parseISO(to);
    for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      buckets.push({ key: toISO(d).slice(0, 7), label: MONTHS_SHORT[d.getMonth()], income: 0, expense: 0 });
    }
    rows.forEach(t => {
      const b = buckets.find(x => x.key === t.date.slice(0, 7));
      if (b) b[t.type] += t.amount;
    });
  }
  return buckets.map(b => ({ ...b, savings: b.income - b.expense }));
}

/* ---------- Insights (plain calculations, not AI) ---------- */

export function buildInsights(txns, goals, fmt) {
  const out = [];
  const curr = categoryBreakdown(inRange(txns, toISO(monthStart(0)), todayISO()));
  const today = todayISO();
  const dayNum = Number(today.slice(8));
  const lastFrom = toISO(monthStart(1));
  const lastTo = `${lastFrom.slice(0, 8)}${String(dayNum).padStart(2, '0')}`;
  const prev = categoryBreakdown(inRange(txns, lastFrom, lastTo));
  const get = (rows, id) => rows.find(r => r.id === id)?.amount ?? 0;

  const food = pctChange(get(curr, 'food'), get(prev, 'food'));
  if (food !== null) {
    out.push(food > 0
      ? { tone: 'warning', icon: 'trending-up', title: `Food spending is up ${Math.round(food)}%`, body: `You've spent ${fmt(get(curr, 'food'))} on food so far, compared with ${fmt(get(prev, 'food'))} at this point last month.` }
      : { tone: 'success', icon: 'trending-down', title: `Food spending is down ${Math.round(Math.abs(food))}%`, body: `${fmt(get(curr, 'food'))} so far, versus ${fmt(get(prev, 'food'))} at this point last month.` });
  }
  const transport = pctChange(get(curr, 'transport'), get(prev, 'transport'));
  if (transport !== null) {
    out.push(transport <= 0
      ? { tone: 'success', icon: 'trending-down', title: 'You spent less on transport', body: `Transport is ${fmt(get(curr, 'transport'))} so far, ${Math.round(Math.abs(transport))}% below the same point last month.` }
      : { tone: 'warning', icon: 'trending-up', title: `Transport is up ${Math.round(transport)}%`, body: `${fmt(get(curr, 'transport'))} so far compared with ${fmt(get(prev, 'transport'))} last month.` });
  }
  const flexible = curr.filter(r => r.id !== 'bills');
  const flexTotal = flexible.reduce((s, r) => s + r.amount, 0);
  const top = flexible[0];
  if (top && flexTotal > 0) {
    out.push({ tone: 'neutral', icon: 'pie', title: `${top.label} is your biggest flexible expense`, body: `It makes up ${Math.round((top.amount / flexTotal) * 100)}% of your spending outside bills this month.` });
  }
  const laptop = goals.find(g => !g.completedAt && /laptop/i.test(g.name)) ?? goals.find(g => !g.completedAt);
  if (laptop) {
    const s = goalStats(laptop);
    const onTrack = s.perMonth <= 15000;
    out.push(onTrack
      ? { tone: 'success', icon: 'target', title: `You're on track for ${laptop.name}`, body: `Saving about ${fmt(Math.ceil(s.perMonth / 100) * 100)} a month gets you there by the deadline.` }
      : { tone: 'warning', icon: 'target', title: `${laptop.name} needs a faster pace`, body: `You'd need about ${fmt(Math.ceil(s.perMonth / 100) * 100)} a month to finish on time.` });
  }
  return out;
}

/** End-of-month balances for the last `months` months (oldest first, last = now). */
export function balanceSeries(txns, opening, months = 6) {
  const now = balanceNow(txns, opening);
  const out = [now];
  let running = now;
  for (let m = 0; m < months - 1; m++) {
    const monthTxns = inMonth(txns, m);
    const net = sumAmount(monthTxns, 'income') - sumAmount(monthTxns, 'expense');
    running -= net;
    out.unshift(running);
  }
  return out;
}

/** Monthly-equivalent amount of a recurring item. */
export function monthlyEquivalent(r) {
  switch (r.frequency) {
    case 'weekly': return (r.amount * 52) / 12;
    case 'quarterly': return r.amount / 3;
    case 'yearly': return r.amount / 12;
    default: return r.amount;
  }
}
