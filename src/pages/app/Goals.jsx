import { useMemo } from 'react';
import Icon from '../../components/app/Icon';
import DataBoundary from '../../components/app/DataBoundary';
import GoalCard from '../../components/app/GoalCard';
import { PageHeader, EmptyState, ProgressBar } from '../../components/app/ui';
import { GridSkeleton, PageHeaderSkeleton, CardSkeleton } from '../../components/app/Skeletons';
import { useData, useFormat } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';
import './goals.css';

function Goals() {
  const { goals, actions } = useData();
  const fmt = useFormat();
  const ui = useUI();
  const toast = useToast();

  const { active, completed, saved, target } = useMemo(() => {
    const a = goals.filter(g => !g.completedAt).sort((x, y) => (x.deadline > y.deadline ? 1 : -1));
    const c = goals.filter(g => g.completedAt).sort((x, y) => (x.completedAt < y.completedAt ? 1 : -1));
    return { active: a, completed: c, saved: a.reduce((s, g) => s + g.saved, 0), target: a.reduce((s, g) => s + g.target, 0) };
  }, [goals]);
  const pct = target > 0 ? (saved / target) * 100 : 0;

  const onDelete = (g) => ui.confirm({
    title: 'Delete this goal?', confirmLabel: 'Delete goal',
    message: `"${g.name}" and its progress (${fmt.money(g.saved)} saved) will be removed from Monevo. Your actual money isn't touched.`,
    onConfirm: () => { actions.deleteGoal(g.id); toast.success('Goal deleted.'); },
  });
  const handlers = { onAdd: ui.openAddMoney, onEdit: (g) => ui.openGoal({ goal: g }), onDelete };

  return (
    <>
      <PageHeader title="Savings goals" subtitle="Plan for what matters and watch your progress add up.">
        <button className="btn btn-primary" onClick={() => ui.openGoal()}><Icon name="plus" size={16} strokeWidth={2.3} />Create goal</button>
      </PageHeader>

      {goals.length === 0 ? (
        <div className="card">
          <EmptyState icon="target" title="No savings goals yet" text="Start planning for something important — a trip, a laptop, an emergency fund."
            action={<button className="btn btn-primary" onClick={() => ui.openGoal()}>Create your first goal</button>} />
        </div>
      ) : (
        <>
          <section className="card goals-summary" aria-label="Savings summary">
            <div className="goals-summary__main">
              <p className="goals-summary__label">Total saved across active goals</p>
              <p className="goals-summary__value tabular">{fmt.money(saved)}<span> of {fmt.money(target)}</span></p>
              <ProgressBar value={pct} size="lg" label="Overall savings progress" />
              <p className="goals-summary__foot">{Math.round(pct)}% of your combined target</p>
            </div>
            <dl className="goals-summary__stats">
              <div><dt>Active goals</dt><dd>{active.length}</dd></div>
              <div><dt>Completed</dt><dd>{completed.length}</dd></div>
              <div><dt>Still to save</dt><dd className="tabular">{fmt.money(Math.max(0, target - saved))}</dd></div>
            </dl>
          </section>

          <h2 className="section-title">Active goals</h2>
          {active.length === 0 ? (
            <div className="card">
              <EmptyState compact icon="check-circle" title="All goals completed" text="Nice work. Ready for the next one?"
                action={<button className="btn btn-primary btn-sm" onClick={() => ui.openGoal()}>Create a goal</button>} />
            </div>
          ) : (
            <div className="card-grid">{active.map(g => <GoalCard key={g.id} goal={g} {...handlers} />)}</div>
          )}

          {completed.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 'var(--space-10)' }}>Completed</h2>
              <div className="card-grid">{completed.map(g => <GoalCard key={g.id} goal={g} {...handlers} />)}</div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default function GoalsPage() {
  return (
    <DataBoundary skeleton={<><PageHeaderSkeleton /><CardSkeleton height={90} title={false} /><div style={{ height: 24 }} /><GridSkeleton count={3} height={150} /></>}>
      <Goals />
    </DataBoundary>
  );
}
