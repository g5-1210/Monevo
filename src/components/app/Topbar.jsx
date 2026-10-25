import { Link } from 'react-router-dom';
import Icon from './Icon';
import BrandMark from './BrandMark';
import Dropdown, { DropdownItem } from './Dropdown';
import NotificationPanel from './NotificationPanel';
import { Avatar } from './ui';
import { ThemeToggle } from '../Navbar';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

const today = () => new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Topbar() {
  const { user } = useData();
  const ui = useUI();
  const { logout } = useAuth();

  const confirmLogout = () => ui.confirm({
    title: 'Log out of Monevo?', icon: 'log-out', tone: 'primary', confirmLabel: 'Log out',
    message: "You'll need to log in again to see your finances.",
    onConfirm: logout,
  });

  return (
    <header className="topbar">
      <Link to="/dashboard" className="topbar__brand" aria-label="Monevo dashboard"><BrandMark size={22} /><span>Monevo</span></Link>
      <p className="topbar__date"><Icon name="calendar" size={16} />{today()}</p>

      <div className="topbar__actions">
        <Dropdown label="Create new" trigger={({ open, toggle }) => (
          <button className="btn btn-primary btn-sm topbar__new" onClick={toggle} aria-expanded={open} aria-haspopup="menu">
            <Icon name="plus" size={16} strokeWidth={2.3} /> New
          </button>
        )}>
          <DropdownItem icon={<Icon name="arrow-up-right" size={16} />} onClick={() => ui.openTransaction({ defaultType: 'expense' })}>Add expense</DropdownItem>
          <DropdownItem icon={<Icon name="arrow-down-left" size={16} />} onClick={() => ui.openTransaction({ defaultType: 'income' })}>Add income</DropdownItem>
          <div className="dropdown__sep" />
          <DropdownItem icon={<Icon name="pie" size={16} />} onClick={() => ui.openBudget()}>Create budget</DropdownItem>
          <DropdownItem icon={<Icon name="target" size={16} />} onClick={() => ui.openGoal()}>Add savings goal</DropdownItem>
          <DropdownItem icon={<Icon name="repeat" size={16} />} onClick={() => ui.openRecurring()}>Recurring payment</DropdownItem>
        </Dropdown>

        <ThemeToggle />
        <NotificationPanel />

        <Dropdown label="Account" trigger={({ open, toggle }) => (
          <button className="topbar__avatar" onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label="Account menu">
            <Avatar name={user.name} src={user.avatar} />
          </button>
        )}>
          <div className="topbar__who"><strong>{user.name}</strong><span>{user.email}</span></div>
          <div className="dropdown__sep" />
          <DropdownItem as={Link} to="/settings" icon={<Icon name="user" size={16} />}>Profile &amp; settings</DropdownItem>
          <DropdownItem icon={<Icon name="log-out" size={16} />} onClick={confirmLogout}>Log out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
