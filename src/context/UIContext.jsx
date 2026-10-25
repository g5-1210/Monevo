import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import TransactionForm from '../components/forms/TransactionForm';
import BudgetForm from '../components/forms/BudgetForm';
import { GoalForm, AddMoneyForm } from '../components/forms/GoalForms';
import RecurringForm from '../components/forms/RecurringForm';
import { ConfirmDialog } from '../components/app/Modal';

/* One place that owns "which dialog is open", so any page, the topbar or the
   quick actions can open the same forms without prop drilling. */
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const close = useCallback(() => { setDialog(null); setBusy(false); }, []);

  const api = useMemo(() => ({
    openTransaction: (props = {}) => setDialog({ kind: 'transaction', props }),
    openBudget:      (props = {}) => setDialog({ kind: 'budget', props }),
    openGoal:        (props = {}) => setDialog({ kind: 'goal', props }),
    openAddMoney:    (goal)       => setDialog({ kind: 'add-money', props: { goal } }),
    openRecurring:   (props = {}) => setDialog({ kind: 'recurring', props }),
    /** confirm({ title, message, confirmLabel, tone, icon, onConfirm }) */
    confirm:         (props)      => setDialog({ kind: 'confirm', props }),
    close,
  }), [close]);

  const runConfirm = async () => {
    setBusy(true);
    await new Promise(r => setTimeout(r, 350));
    await dialog.props.onConfirm();
    close();
  };

  return (
    <UIContext.Provider value={api}>
      {children}
      {dialog?.kind === 'transaction' && <TransactionForm {...dialog.props} onClose={close} />}
      {dialog?.kind === 'budget'      && <BudgetForm {...dialog.props} onClose={close} />}
      {dialog?.kind === 'goal'        && <GoalForm {...dialog.props} onClose={close} />}
      {dialog?.kind === 'add-money'   && <AddMoneyForm {...dialog.props} onClose={close} />}
      {dialog?.kind === 'recurring'   && <RecurringForm {...dialog.props} onClose={close} />}
      {dialog?.kind === 'confirm'     && <ConfirmDialog {...dialog.props} busy={busy} onConfirm={runConfirm} onClose={close} />}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
