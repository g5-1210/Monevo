/* Demo transactions: this month is hand-written, earlier months are generated
   with a seeded generator so the numbers stay stable between reloads. */
import { dateIn } from '../utils/dates.js';

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let n = 0;
const tx = (offset, day, type, title, category, amount, method, notes = '') => ({
  id: `t${++n}`, type, title, category, amount, method, notes, date: dateIn(offset, day),
});

/* ---- This month (hand-written) ---- */
const thisMonth = [
  ['income',  1, 'Salary — Acme Studio',        'salary',    58000, 'Bank Transfer'],
  ['income',  5, 'Landing page design project', 'freelance', 12000, 'UPI', 'Invoice #014'],
  ['expense', 2, 'Rent — October',              'bills',     14000, 'Bank Transfer'],
  ['expense', 4, 'Jio Fiber',                   'bills',       799, 'UPI'],
  ['expense', 6, 'Electricity bill',            'bills',      1240, 'UPI'],
  ['expense', 8, 'Swiggy',                      'food',        420, 'UPI'],
  ['expense', 6, 'Zomato',                      'food',        560, 'UPI'],
  ['expense', 4, 'BigBasket',                   'food',       1380, 'Credit Card'],
  ['expense', 7, 'Starbucks',                   'food',        340, 'Credit Card'],
  ['expense', 5, "Domino's",                    'food',        515, 'UPI'],
  ['expense', 3, 'Cafe Coffee Day',             'food',        285, 'UPI'],
  ['expense', 7, 'Chai Point',                  'food',        130, 'Cash'],
  ['expense', 8, 'Uber',                        'transport',   286, 'UPI'],
  ['expense', 7, 'Ola',                         'transport',   214, 'UPI'],
  ['expense', 2, 'Metro card recharge',         'transport',   500, 'UPI'],
  ['expense', 5, 'Rapido',                      'transport',   142, 'UPI'],
  ['expense', 4, 'Petrol',                      'transport',  1000, 'Debit Card'],
  ['expense', 4, 'Myntra',                      'shopping',   2199, 'Credit Card'],
  ['expense', 6, 'Amazon',                      'shopping',   1649, 'Credit Card', 'Keyboard + desk mat'],
  ['expense', 7, 'Nykaa',                       'shopping',    549, 'UPI'],
  ['expense', 3, 'Spotify Premium',             'entertainment', 119, 'Credit Card'],
  ['expense', 5, 'BookMyShow',                  'entertainment', 1100, 'UPI'],
  ['expense', 6, 'Steam',                       'entertainment',  899, 'Credit Card'],
  ['expense', 7, 'PVR Cinemas',                 'entertainment',  640, 'UPI'],
  ['expense', 3, 'Apollo Pharmacy',             'health',      480, 'UPI'],
  ['expense', 6, 'Birthday gift',               'other',      1200, 'UPI'],
];

/* ---- Previous 11 months (generated) ---- */
const VARIABLE = {
  food:          { names: ['Swiggy', 'Zomato', 'BigBasket', 'Blinkit', 'Starbucks', "Domino's", 'Cafe Coffee Day'], min: 180, max: 1400, count: 15 },
  transport:     { names: ['Uber', 'Ola', 'Rapido', 'Metro card recharge', 'Petrol'], min: 120, max: 1000, count: 9 },
  shopping:      { names: ['Amazon', 'Myntra', 'Flipkart', 'Decathlon', 'Nykaa'], min: 600, max: 3400, count: 3 },
  entertainment: { names: ['BookMyShow', 'PVR Cinemas', 'Steam', 'Zomato Gold'], min: 300, max: 1400, count: 2 },
  health:        { names: ['Apollo Pharmacy', 'Cult.fit', 'Dr. Mehta clinic'], min: 300, max: 1800, count: 1 },
  other:         { names: ['Gift', 'Stationery', 'Donation'], min: 300, max: 1800, count: 1 },
};
const METHODS = ['UPI', 'UPI', 'UPI', 'Credit Card', 'Debit Card', 'Cash'];

function generateMonth(offset) {
  const r = rng(1000 + offset * 77);
  const out = [];
  const salary = offset > 6 ? 55000 : 58000;
  out.push(tx(offset, 1, 'income', 'Salary — Acme Studio', 'salary', salary, 'Bank Transfer'));
  if ([1, 3, 4, 7, 9].includes(offset)) {
    out.push(tx(offset, 12, 'income', 'Freelance project', 'freelance', Math.round((8000 + r() * 7000) / 500) * 500, 'UPI'));
  }
  if (offset === 5) out.push(tx(offset, 20, 'income', 'Mutual fund dividend', 'investments', 3200, 'Bank Transfer'));
  out.push(tx(offset, 2, 'expense', 'Rent', 'bills', 14000, 'Bank Transfer'));
  out.push(tx(offset, 6, 'expense', 'Jio Fiber', 'bills', 799, 'UPI'));
  out.push(tx(offset, 9, 'expense', 'Electricity bill', 'bills', Math.round(900 + r() * 800), 'UPI'));
  out.push(tx(offset, 3, 'expense', 'Spotify Premium', 'entertainment', 119, 'Credit Card'));
  out.push(tx(offset, 14, 'expense', 'Netflix', 'entertainment', 649, 'Credit Card'));
  Object.entries(VARIABLE).forEach(([category, v]) => {
    const count = category === 'health' || category === 'other'
      ? (r() > 0.4 ? 1 : 0)
      : v.count + Math.round((r() - 0.5) * 4);
    for (let i = 0; i < count; i++) {
      const name = v.names[Math.floor(r() * v.names.length)];
      const amount = Math.round((v.min + r() * (v.max - v.min)) / 10) * 10;
      const day = 1 + Math.floor(r() * 28);
      out.push(tx(offset, day, 'expense', name, category, amount, METHODS[Math.floor(r() * METHODS.length)]));
    }
  });
  return out;
}

const generated = Array.from({ length: 11 }, (_, i) => generateMonth(i + 1)).flat();
const current = thisMonth.map(([type, day, title, category, amount, method, notes]) =>
  tx(0, day, type, title, category, amount, method, notes));

export const transactions = [...current, ...generated]
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
