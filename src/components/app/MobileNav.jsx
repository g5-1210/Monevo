import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import Modal from './Modal';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

/* Bottom tab bar for phones: 2 tabs, a centre "add" button, 1 tab, and "More". */
export default function MobileNav() {
  const [sheet, setSheet] = useState(null); // 'add' | 'more'
  const ui = useUI();
  const { logout } = useAuth();
  const close = () => setSheet(null);

  const tab = (to, icon, label) => (
    <NavLink to={to} className={({ isActive }) => `mnav__tab${isActive ? ' is-active' : ''}`}>
      <Icon name={icon} size={21} /><span>{label}</span>
    </NavLink>
  );

  const quick = [
    { label: 'Add expense', hint: 'Money you spent', icon: 'arrow-up-right', run: () => ui.openTransaction({ defaultType: 'expense' }) },
    { label: 'Add income', hint: 'Money you received', icon: 'arrow-down-left', run: () => ui.openTransaction({ defaultType: 'income' }) },
    { label: 'Create budget', hint: 'Limit a category', icon: 'pie', run: () => ui.openBudget() },
    { label: 'Add savings goal', hint: 'Plan for something', icon: 'target', run: () => ui.openGoal() },
  ];

  return (
    <>
      <nav className="mnav" aria-label="Primary">
        {tab('/dashboard', 'dashboard', 'Home')}
        {tab('/transactions', 'transactions', 'Activity')}
        <button className="mnav__add" onClick={() => setSheet('add')} aria-label="Add new"><Icon name="plus" size={24} strokeWidth={2.4} /></button>
        {tab('/budgets', 'pie', 'Budgets')}
        <button className={`mnav__tab${sheet === 'more' ? ' is-active' : ''}`} onClick={() => setSheet('more')}>
          <Icon name="menu" size={21} /><span>More</span>
        </button>
      </nav>

      {sheet === 'add' && (
        <Modal title="Add new" onClose={close}>
          <div className="sheet-list">
            {quick.map(q => (
              <button key={q.label} className="sheet-list__item" onClick={() => { close(); q.run(); }}>
                <span className="sheet-list__icon"><Icon name={q.icon} size={18} /></span>
                <span><strong>{q.label}</strong><small>{q.hint}</small></span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {sheet === 'more' && (
        <Modal title="More" onClose={close}>
          <div className="sheet-list">
            {[['/goals', 'target', 'Savings goals'], ['/analytics', 'chart', 'Analytics'], ['/recurring', 'repeat', 'Recurring payments'], ['/settings', 'sliders', 'Settings']].map(([to, icon, label]) => (
              <NavLink key={to} to={to} className="sheet-list__item" onClick={close}>
                <span className="sheet-list__icon"><Icon name={icon} size={18} /></span>
                <span><strong>{label}</strong></span>
                <Icon name="chevron-right" size={16} className="sheet-list__chev" />
              </NavLink>
            ))}
            <button className="sheet-list__item sheet-list__item--danger" onClick={() => {
              close();
              ui.confirm({
                title: 'Log out of Monevo?', icon: 'log-out', tone: 'primary', confirmLabel: 'Log out',
                message: "You'll need to log in again to see your finances.",
                onConfirm: logout,
              });
            }}>
              <span className="sheet-list__icon"><Icon name="log-out" size={18} /></span>
              <span><strong>Log out</strong></span>
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
