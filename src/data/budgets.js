import { monthStart, toISO } from '../utils/dates.js';

const start = toISO(monthStart(0));

/* Spent amounts are derived from transactions — only limits live here. */
export const budgets = [
  { id: 'b1', category: 'food',          limit: 6000,  startDate: start, alertThreshold: 80 },
  { id: 'b2', category: 'transport',     limit: 3500,  startDate: start, alertThreshold: 80 },
  { id: 'b3', category: 'shopping',      limit: 5000,  startDate: start, alertThreshold: 80 },
  { id: 'b4', category: 'bills',         limit: 22000, startDate: start, alertThreshold: 85 },
  { id: 'b5', category: 'entertainment', limit: 2500,  startDate: start, alertThreshold: 80 },
  { id: 'b6', category: 'health',        limit: 2000,  startDate: start, alertThreshold: 90 },
];
