const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString();

export const notifications = [
  { id: 'n1', type: 'budget-exceeded', title: 'Entertainment budget exceeded',
    body: "You've spent ₹2,758 of your ₹2,500 limit this month.", createdAt: ago(35), read: false, to: '/budgets' },
  { id: 'n2', type: 'budget-warning', title: 'Shopping budget almost reached',
    body: "You've used 88% of your shopping budget.", createdAt: ago(190), read: false, to: '/budgets' },
  { id: 'n3', type: 'payment', title: 'Netflix is due soon',
    body: '₹649 will be charged on the 14th.', createdAt: ago(60 * 20), read: false, to: '/recurring' },
  { id: 'n4', type: 'goal', title: 'New Laptop is over halfway',
    body: "You've saved 56% of your target. Keep it going.", createdAt: ago(60 * 52), read: true, to: '/goals' },
  { id: 'n5', type: 'summary', title: 'Your September summary is ready',
    body: 'See how your income, spending and savings compared.', createdAt: ago(60 * 24 * 8), read: true, to: '/analytics' },
];
