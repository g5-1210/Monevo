import Icon from './Icon';
import Dropdown, { DropdownItem } from './Dropdown';
import { Badge, ProgressBar } from './ui';
import { goalStats } from '../../utils/finance';
import { formatMonthYear } from '../../utils/format';
import { useFormat } from '../../context/DataContext';

function deadlineBadge(g, s) {
  if (s.done) return <Badge tone="success"><Icon name="check" size={12} strokeWidth={2.6} />Completed</Badge>;
  if (s.overdue) return <Badge tone="danger">Past due</Badge>;
  if (s.daysLeft <= 30) return <Badge tone="warning">{s.daysLeft} days left</Badge>;
  return <Badge>Due {formatMonthYear(g.deadline)}</Badge>;
}

/* Compact row for the dashboard */
export function GoalRow({ goal: g }) {
  const { money } = useFormat();
  const s = goalStats(g);
  return (
    <div className="goal-row">
      <div className="goal-row__top">
        <span className="goal-row__name"><span className="goal-row__icon"><Icon name={g.icon ?? 'target'} size={15} /></span>{g.name}</span>
        <span className="goal-row__pct tabular">{Math.round(s.pct)}%</span>
      </div>
      <ProgressBar value={s.pct} size="sm" tone={s.done ? 'success' : undefined} label={g.name} />
      <p className="goal-row__foot"><span className="tabular"><strong>{money(g.saved)}</strong> / {money(g.target)}</span><span>Due {formatMonthYear(g.deadline)}</span></p>
    </div>
  );
}

export default function GoalCard({ goal: g, onAdd, onEdit, onDelete }) {
  const { money, date } = useFormat();
  const s = goalStats(g);
  return (
    <article className={`goal-card${s.done ? ' goal-card--done' : ''}`}>
      <div className="goal-card__head">
        <span className="goal-card__icon"><Icon name={s.done ? 'check-circle' : g.icon ?? 'target'} size={22} /></span>
        <div className="goal-card__title">
          <h3>{g.name}</h3>
          {deadlineBadge(g, s)}
        </div>
        <Dropdown label={`Actions for ${g.name}`} trigger={({ open, toggle }) => (
          <button className="btn btn-icon" onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label={`Actions for ${g.name}`}><Icon name="dots" size={18} /></button>
        )}>
          <DropdownItem icon={<Icon name="edit" size={16} />} onClick={() => onEdit(g)}>Edit goal</DropdownItem>
          <DropdownItem danger icon={<Icon name="trash" size={16} />} onClick={() => onDelete(g)}>Delete</DropdownItem>
        </Dropdown>
      </div>
      {g.description && <p className="goal-card__desc">{g.description}</p>}
      <div className="goal-card__figures">
        <p className="tabular"><strong>{money(g.saved)}</strong><span> saved of {money(g.target)}</span></p>
        <span className="goal-card__pct tabular">{Math.round(s.pct)}%</span>
      </div>
      <ProgressBar value={s.pct} tone={s.done ? 'success' : undefined} label={`${g.name} progress`} />
      <div className="goal-card__foot">
        {s.done ? (
          <p className="goal-card__note">Completed{g.completedAt ? ` on ${date(g.completedAt)}` : ''}</p>
        ) : (
          <>
            <p className="goal-card__note"><strong className="tabular">{money(s.remaining)}</strong> to go · {date(g.deadline)}</p>
            <button className="btn btn-secondary btn-sm" onClick={() => onAdd(g)}><Icon name="plus" size={14} strokeWidth={2.3} />Add money</button>
          </>
        )}
      </div>
    </article>
  );
}
