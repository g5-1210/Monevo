import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon';
import BrandMark from './BrandMark';
import { NAV_ITEMS, SETTINGS_ITEM } from './nav';

function Item({ item }) {
  return (
    <NavLink to={item.to} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`} title={item.label}>
      <Icon name={item.icon} size={19} />
      <span className="sidebar__label">{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <Link to="/dashboard" className="sidebar__brand" aria-label="Monevo dashboard">
        <span className="sidebar__logo"><BrandMark size={22} /></span>
        <span className="sidebar__brand-name sidebar__label">Monevo</span>
      </Link>

      <nav className="sidebar__nav" aria-label="Main">
        <p className="sidebar__heading sidebar__label">Menu</p>
        {NAV_ITEMS.map(i => <Item key={i.to} item={i} />)}
      </nav>

      <div className="sidebar__foot">
        <Item item={SETTINGS_ITEM} />
        <button className="sidebar__collapse" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand' : 'Collapse'}>
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={18} />
          <span className="sidebar__label">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
