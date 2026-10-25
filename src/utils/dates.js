/* Date helpers. Dates travel through the app as ISO strings (YYYY-MM-DD). */

export const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISO(new Date());
export const monthKey = (iso) => iso.slice(0, 7);

export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** First day of the month `monthsAgo` months back (0 = this month). */
export function monthStart(monthsAgo = 0, now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
}
export const monthKeyFor = (monthsAgo = 0) => toISO(monthStart(monthsAgo)).slice(0, 7);

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

/** ISO date for `day` of the month `offset` months ago. Never later than today. */
export function dateIn(offset, day) {
  const now = new Date();
  const first = monthStart(offset, now);
  let d = Math.min(day, daysInMonth(first.getFullYear(), first.getMonth()));
  if (offset === 0) d = Math.min(d, now.getDate());
  return toISO(new Date(first.getFullYear(), first.getMonth(), d));
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function daysBetween(aISO, bISO) {
  const ms = parseISO(bISO) - parseISO(aISO);
  return Math.round(ms / 86400000);
}

/** Next date a recurring item is due (on/after today). */
export function nextOccurrence(item, from = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const clamp = (y, m, d) => new Date(y, m, Math.min(d, daysInMonth(y, m)));

  if (item.frequency === 'weekly') {
    const diff = (item.weekday - today.getDay() + 7) % 7;
    return toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff));
  }
  if (item.frequency === 'yearly') {
    let c = clamp(today.getFullYear(), item.month ?? 0, item.day);
    if (c < today) c = clamp(today.getFullYear() + 1, item.month ?? 0, item.day);
    return toISO(c);
  }
  const step = item.frequency === 'quarterly' ? 3 : 1;
  const base = item.frequency === 'quarterly' ? (item.month ?? 0) % 3 : 0;
  for (let i = 0; i < 14; i++) {
    const m = today.getMonth() + i;
    if (step === 3 && ((m % 12) - base + 12) % 3 !== 0) continue;
    const c = clamp(today.getFullYear(), m, item.day);
    if (c >= today) return toISO(c);
  }
  return toISO(today);
}

export function relativeTime(date, now = new Date()) {
  const mins = Math.round((now - date) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}
