import { MONTHS_SHORT, parseISO, pad } from './dates.js';

export const CURRENCIES = {
  INR: { label: 'Indian Rupee (₹)', locale: 'en-IN' },
  USD: { label: 'US Dollar ($)',    locale: 'en-US' },
  EUR: { label: 'Euro (€)',         locale: 'de-DE' },
  GBP: { label: 'British Pound (£)', locale: 'en-GB' },
};

export const DATE_FORMATS = {
  'DD MMM YYYY': '08 Oct 2026',
  'MMM DD, YYYY': 'Oct 08, 2026',
  'DD/MM/YYYY': '08/10/2026',
  'MM/DD/YYYY': '10/08/2026',
};

export function formatMoney(value, currency = 'INR', { compact = false } = {}) {
  const { locale } = CURRENCIES[currency] ?? CURRENCIES.INR;
  if (compact && currency === 'INR') {
    const n = Math.abs(value);
    const sym = value < 0 ? '−₹' : '₹';
    const f = (x) => `${sym}${+x.toFixed(1)}`;
    if (n >= 1e7) return `${f(n / 1e7)}Cr`.replace(sym + '−', sym);
    if (n >= 1e5) return `${f(n / 1e5)}L`;
    if (n >= 1e3) return `${f(n / 1e3)}K`;
    return `${sym}${Math.round(n)}`;
  }
  const opts = { style: 'currency', currency, maximumFractionDigits: 0 };
  if (compact) {
    opts.notation = 'compact';
    opts.maximumFractionDigits = 1;
  }
  return new Intl.NumberFormat(locale, opts).format(value);
}

export const formatPercent = (v, digits = 0) => `${v.toFixed(digits)}%`;

export function formatChange(v, digits = 1) {
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${Math.abs(v).toFixed(digits)}%`;
}

/** Full date, honouring the user's date-format preference. */
export function formatDate(iso, fmt = 'DD MMM YYYY') {
  const d = parseISO(iso);
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const mon = MONTHS_SHORT[d.getMonth()];
  const yyyy = d.getFullYear();
  switch (fmt) {
    case 'MMM DD, YYYY': return `${mon} ${dd}, ${yyyy}`;
    case 'DD/MM/YYYY':   return `${dd}/${mm}/${yyyy}`;
    case 'MM/DD/YYYY':   return `${mm}/${dd}/${yyyy}`;
    default:             return `${dd} ${mon} ${yyyy}`;
  }
}

/** Day + month only (no year). */
export function formatDay(iso, fmt = 'DD MMM YYYY') {
  const d = parseISO(iso);
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const mon = MONTHS_SHORT[d.getMonth()];
  switch (fmt) {
    case 'MMM DD, YYYY': return `${mon} ${dd}`;
    case 'DD/MM/YYYY':   return `${dd}/${mm}`;
    case 'MM/DD/YYYY':   return `${mm}/${dd}`;
    default:             return `${dd} ${mon}`;
  }
}

export function formatMonthYear(iso) {
  const d = parseISO(iso.length === 7 ? `${iso}-01` : iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
