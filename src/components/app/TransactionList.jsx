import Icon from './Icon';
import Dropdown, { DropdownItem } from './Dropdown';
import { CategoryIcon } from './ui';
import { categoryById } from '../../data/categories';
import { useFormat } from '../../context/DataContext';

function Amount({ t }) {
  const { money } = useFormat();
  return (
    <span className={`txn__amount tabular amt--${t.type}`}>
      {t.type === 'income' ? '+' : '−'}{money(t.amount)}
    </span>
  );
}

/* Dashboard-style compact list */
export function TransactionListCompact({ items }) {
  const { day } = useFormat();
  return (
    <ul className="txn-list">
      {items.map(t => (
        <li key={t.id} className="txn-list__row">
          <CategoryIcon category={t.category} />
          <div className="txn-list__main">
            <p className="txn-list__title">{t.title}</p>
            <p className="txn-list__meta">{categoryById(t.category).label} · {day(t.date)}</p>
          </div>
          <Amount t={t} />
        </li>
      ))}
    </ul>
  );
}

/* Full table on desktop, stacked cards on phones (see domain.css) */
export function TransactionTable({ items, onEdit, onDelete }) {
  const { date, day } = useFormat();
  return (
    <div className="table-wrap">
      <table className="txn-table">
        <thead>
          <tr>
            <th scope="col">Transaction</th>
            <th scope="col">Category</th>
            <th scope="col">Date</th>
            <th scope="col">Payment</th>
            <th scope="col" className="th-right">Amount</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t.id}>
              <td className="txn-table__name">
                <CategoryIcon category={t.category} />
                <div>
                  <p className="txn-list__title">{t.title}</p>
                  {t.notes && <p className="txn-list__meta txn-table__notes">{t.notes}</p>}
                </div>
              </td>
              <td className="txn-table__cat"><span className="txn-tag">{categoryById(t.category).label}</span></td>
              <td className="txn-table__date">
                <span className="txn-table__date-full">{date(t.date)}</span>
                <span className="txn-table__date-short">{day(t.date)}</span>
              </td>
              <td className="txn-table__method">{t.method}</td>
              <td className="txn-table__amount"><Amount t={t} /></td>
              <td className="txn-table__actions">
                <Dropdown label={`Actions for ${t.title}`} trigger={({ open, toggle }) => (
                  <button className="btn btn-icon" onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label={`Actions for ${t.title}`}>
                    <Icon name="dots" size={18} />
                  </button>
                )}>
                  <DropdownItem icon={<Icon name="edit" size={16} />} onClick={() => onEdit(t)}>Edit</DropdownItem>
                  <DropdownItem danger icon={<Icon name="trash" size={16} />} onClick={() => onDelete(t)}>Delete</DropdownItem>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
