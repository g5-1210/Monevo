import Icon from './Icon';
import Dropdown, { DropdownItem } from './Dropdown';
import { Badge, CategoryIcon, ProgressBar } from './ui';
import { categoryById } from '../../data/categories';
import { BUDGET_STATE } from '../../utils/finance';
import { useFormat } from '../../context/DataContext';

const BAR_TONE = { ok: undefined, warn: 'warning', over: 'danger' };

function summary(b, money) {
  if (b.state === 'over') return `${money(Math.abs(b.remaining))} over budget`;
  return `${money(b.remaining)} remaining`;
}

/* Slim row for the dashboard */
export function BudgetRow({ budget: b }) {
  const { money } = useFormat();
  const cat = categoryById(b.category);
  return (
    <div className="budget-row">
      <div className="budget-row__top">
        <span className="budget-row__name"><CategoryIcon category={b.category} size="sm" />{cat.label}</span>
        <span className="budget-row__amt tabular"><strong>{money(b.spent)}</strong> / {money(b.limit)}</span>
      </div>
      <ProgressBar value={b.pct} tone={BAR_TONE[b.state]} size="sm" label={`${cat.label} budget`} />
      <p className={`budget-row__foot budget-row__foot--${b.state}`}>
        <span>{Math.round(b.pct)}% used</span><span>{summary(b, money)}</span>
      </p>
    </div>
  );
}

/* Full card for the budgets page */
export default function BudgetCard({ budget: b, onEdit, onDelete }) {
  const { money } = useFormat();
  const cat = categoryById(b.category);
  const status = BUDGET_STATE[b.state];
  return (
    <article className={`budget-card budget-card--${b.state}`}>
      <div className="budget-card__head">
        <CategoryIcon category={b.category} size="lg" />
        <div className="budget-card__title">
          <h3>{cat.label}</h3>
          <Badge tone={status.tone} dot>{status.label}</Badge>
        </div>
        <Dropdown label={`Actions for ${cat.label} budget`} trigger={({ open, toggle }) => (
          <button className="btn btn-icon" onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label={`Actions for ${cat.label} budget`}><Icon name="dots" size={18} /></button>
        )}>
          <DropdownItem icon={<Icon name="edit" size={16} />} onClick={() => onEdit(b)}>Edit budget</DropdownItem>
          <DropdownItem danger icon={<Icon name="trash" size={16} />} onClick={() => onDelete(b)}>Delete</DropdownItem>
        </Dropdown>
      </div>
      <p className="budget-card__amount tabular"><strong>{money(b.spent)}</strong><span> / {money(b.limit)}</span></p>
      <ProgressBar value={b.pct} tone={BAR_TONE[b.state]} label={`${cat.label} budget used`} />
      <p className={`budget-card__foot budget-row__foot--${b.state}`}>
        <span>{Math.round(b.pct)}% used</span><span>{summary(b, money)}</span>
      </p>
    </article>
  );
}
