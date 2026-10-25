import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { transactions as sampleTransactions } from '../data/transactions';
import { budgets as sampleBudgets } from '../data/budgets';
import { goals as sampleGoals } from '../data/goals';
import { recurring as sampleRecurring } from '../data/recurring';
import { notifications as sampleNotifications } from '../data/notifications';
import { defaultPrefs, SAMPLE_OPENING_BALANCE } from '../data/user';
import { CURRENCIES, formatMoney, formatDate, formatDay } from '../utils/format';
import { todayISO } from '../utils/dates';
import { dataKey, prefsKey } from '../utils/authStore';
import { useAuth } from './AuthContext';

/* App data for the signed-in user, persisted in this browser under per-user keys
   (monevo:data:<userId>, monevo:prefs:<userId>), so accounts never see each other's data.
   To connect a backend, replace readJSON/writeJSON and the `actions` with API calls —
   pages only read from `useData()`. */

const DataContext = createContext(null);

const readJSON = (key) => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; }
};
const writeJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full/blocked: keep in-memory state */ }
};
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const mergePrefs = (stored) => ({ ...defaultPrefs, ...stored, notifications: { ...defaultPrefs.notifications, ...stored?.notifications } });

export function DataProvider({ children }) {
  const { user, updateProfile } = useAuth();
  const [status, setStatus] = useState({ loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  const [prefs, setPrefs] = useState(defaultPrefs);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const ready = useRef(false);

  /* Load this user's data (short delay mimics a network request). Add ?simulate-error to preview the error state. */
  useEffect(() => {
    let cancelled = false;
    ready.current = false;
    setStatus({ loading: true, error: null });
    const timer = setTimeout(() => {
      if (cancelled) return;
      if (attempt === 0 && new URLSearchParams(window.location.search).has('simulate-error')) {
        setStatus({ loading: false, error: "We couldn't load your financial data. Check your connection and try again." });
        return;
      }
      const saved = readJSON(dataKey(user.id)) ?? {};
      setTransactions(saved.transactions ?? []);
      setBudgets(saved.budgets ?? []);
      setGoals(saved.goals ?? []);
      setRecurring(saved.recurring ?? []);
      setNotifications(saved.notifications ?? []);
      setOpeningBalance(saved.openingBalance ?? 0);
      setPrefs(mergePrefs(readJSON(prefsKey(user.id))));
      ready.current = true;
      setStatus({ loading: false, error: null });
    }, 650);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [attempt, user.id]);

  useEffect(() => {
    if (!ready.current) return;
    writeJSON(dataKey(user.id), { transactions, budgets, goals, recurring, notifications, openingBalance });
  }, [user.id, transactions, budgets, goals, recurring, notifications, openingBalance]);

  useEffect(() => {
    if (ready.current) writeJSON(prefsKey(user.id), prefs);
  }, [user.id, prefs]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);

  const actions = useMemo(() => ({
    addTransaction: (data) => { const t = { ...data, id: uid('t') }; setTransactions(l => [t, ...l]); return t; },
    updateTransaction: (id, data) => setTransactions(l => l.map(t => (t.id === id ? { ...t, ...data } : t))),
    deleteTransaction: (id) => setTransactions(l => l.filter(t => t.id !== id)),

    addBudget: (data) => setBudgets(l => [...l, { ...data, id: uid('b') }]),
    updateBudget: (id, data) => setBudgets(l => l.map(b => (b.id === id ? { ...b, ...data } : b))),
    deleteBudget: (id) => setBudgets(l => l.filter(b => b.id !== id)),

    addGoal: (data) => setGoals(l => [...l, { ...data, id: uid('g'), createdAt: todayISO(), icon: data.icon ?? 'target' }]),
    updateGoal: (id, data) => setGoals(l => l.map(g => (g.id === id ? { ...g, ...data } : g))),
    deleteGoal: (id) => setGoals(l => l.filter(g => g.id !== id)),
    addToGoal: (id, amount) => setGoals(l => l.map(g => {
      if (g.id !== id) return g;
      const saved = Math.min(g.target, g.saved + amount);
      return { ...g, saved, completedAt: saved >= g.target ? todayISO() : g.completedAt };
    })),

    addRecurring: (data) => setRecurring(l => [...l, { ...data, id: uid('r') }]),
    updateRecurring: (id, data) => setRecurring(l => l.map(r => (r.id === id ? { ...r, ...data } : r))),
    deleteRecurring: (id) => setRecurring(l => l.filter(r => r.id !== id)),

    markNotificationRead: (id) => setNotifications(l => l.map(n => (n.id === id ? { ...n, read: true } : n))),
    markAllNotificationsRead: () => setNotifications(l => l.map(n => ({ ...n, read: true }))),
    clearNotifications: () => setNotifications([]),

    updateUser: updateProfile,
    updatePrefs: (data) => setPrefs(p => ({ ...p, ...data })),
    updateNotificationPrefs: (data) => setPrefs(p => ({ ...p, notifications: { ...p.notifications, ...data } })),

    /** Replaces this account's finance data with the bundled demo set (for trying the app out). */
    loadSampleData: () => {
      setTransactions(sampleTransactions); setBudgets(sampleBudgets); setGoals(sampleGoals);
      setRecurring(sampleRecurring); setNotifications(sampleNotifications); setOpeningBalance(SAMPLE_OPENING_BALANCE);
    },

    /** Removes this user's finance data and preferences only. Account, login and theme are kept. */
    clearAccountData: async () => {
      await new Promise(r => setTimeout(r, 400)); // placeholder for the API call
      try {
        localStorage.removeItem(dataKey(user.id));
        localStorage.removeItem(prefsKey(user.id));
      } catch {
        throw new Error("We couldn't clear your data from this browser. Please try again.");
      }
      setTransactions([]); setBudgets([]); setGoals([]); setRecurring([]);
      setNotifications([]); setOpeningBalance(0); setPrefs(defaultPrefs);
    },
  }), [updateProfile, user.id]);

  const value = useMemo(() => ({
    status, retry, user, prefs, transactions, budgets, goals, recurring, notifications, openingBalance, actions,
  }), [status, retry, user, prefs, transactions, budgets, goals, recurring, notifications, openingBalance, actions]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

/** Formatters bound to the user's currency + date-format preferences. */
export function useFormat() {
  const { prefs } = useData();
  return useMemo(() => ({
    currency: prefs.currency,
    symbol: (CURRENCIES[prefs.currency] ? formatMoney(0, prefs.currency).replace(/[\d\s.,]/g, '') : '₹'),
    money: (v, opts) => formatMoney(v, prefs.currency, opts),
    date: (iso) => formatDate(iso, prefs.dateFormat),
    day: (iso) => formatDay(iso, prefs.dateFormat),
  }), [prefs.currency, prefs.dateFormat]);
}
