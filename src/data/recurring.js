/* `day` = day of month; `weekday` used for weekly; `month` (0-11) for yearly/quarterly. */
export const recurring = [
  { id: 'r1',  name: 'Salary — Acme Studio', kind: 'income',       type: 'income',  amount: 58000, frequency: 'monthly', day: 1,  category: 'salary',        active: true },
  { id: 'r2',  name: 'Rent',                 kind: 'bill',         type: 'expense', amount: 14000, frequency: 'monthly', day: 2,  category: 'bills',         active: true },
  { id: 'r3',  name: 'Netflix',              kind: 'subscription', type: 'expense', amount: 649,   frequency: 'monthly', day: 14, category: 'entertainment', active: true },
  { id: 'r4',  name: 'Spotify Premium',      kind: 'subscription', type: 'expense', amount: 119,   frequency: 'monthly', day: 3,  category: 'entertainment', active: true },
  { id: 'r5',  name: 'Jio Fiber',            kind: 'bill',         type: 'expense', amount: 799,   frequency: 'monthly', day: 4,  category: 'bills',         active: true },
  { id: 'r6',  name: 'Electricity',          kind: 'bill',         type: 'expense', amount: 1240,  frequency: 'monthly', day: 9,  category: 'bills',         active: true },
  { id: 'r7',  name: 'Cult.fit membership',  kind: 'subscription', type: 'expense', amount: 1500,  frequency: 'monthly', day: 20, category: 'health',        active: false },
  { id: 'r8',  name: 'iCloud+ 200 GB',       kind: 'subscription', type: 'expense', amount: 219,   frequency: 'monthly', day: 22, category: 'other',         active: true },
  { id: 'r9',  name: 'Health insurance',     kind: 'bill',         type: 'expense', amount: 9800,  frequency: 'yearly',  day: 12, month: 10, category: 'health', active: true },
  { id: 'r10', name: 'Weekly groceries',     kind: 'expense',      type: 'expense', amount: 1200,  frequency: 'weekly',  weekday: 6, category: 'food',     active: true },
  { id: 'r11', name: 'Retainer — Pixel Co.', kind: 'income',       type: 'income',  amount: 6000,  frequency: 'monthly', day: 25, category: 'freelance',     active: true },
];
