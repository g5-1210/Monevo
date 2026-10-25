/* Category metadata shared by transactions, budgets and charts. */
export const CATEGORIES = [
  { id: 'food',          label: 'Food',          type: 'expense', icon: 'utensils',  color: '#3B82F6' },
  { id: 'transport',     label: 'Transport',     type: 'expense', icon: 'car',       color: '#06B6D4' },
  { id: 'shopping',      label: 'Shopping',      type: 'expense', icon: 'bag',       color: '#8B5CF6' },
  { id: 'bills',         label: 'Bills',         type: 'expense', icon: 'receipt',   color: '#64748B' },
  { id: 'entertainment', label: 'Entertainment', type: 'expense', icon: 'play',      color: '#F59E0B' },
  { id: 'health',        label: 'Health',        type: 'expense', icon: 'heart',     color: '#10B981' },
  { id: 'other',         label: 'Other',         type: 'expense', icon: 'dots',      color: '#94A3B8' },
  { id: 'salary',        label: 'Salary',        type: 'income',  icon: 'briefcase', color: '#16A34A' },
  { id: 'freelance',     label: 'Freelance',     type: 'income',  icon: 'laptop',    color: '#22C55E' },
  { id: 'investments',   label: 'Investments',   type: 'income',  icon: 'trending',  color: '#14B8A6' },
  { id: 'other-income',  label: 'Other income',  type: 'income',  icon: 'wallet',    color: '#84CC16' },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.type === 'expense');
export const INCOME_CATEGORIES = CATEGORIES.filter(c => c.type === 'income');
export const categoryById = (id) => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[6];

export const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cash'];
