export const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: 'dashboard' },
  { to: '/transactions', label: 'Transactions', icon: 'transactions' },
  { to: '/budgets',      label: 'Budgets',      icon: 'pie' },
  { to: '/goals',        label: 'Goals',        icon: 'target' },
  { to: '/analytics',    label: 'Analytics',    icon: 'chart' },
  { to: '/recurring',    label: 'Recurring',    icon: 'repeat' },
];
export const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: 'sliders' };
export const ALL_ROUTES = [...NAV_ITEMS, SETTINGS_ITEM];
