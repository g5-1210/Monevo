import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { ALL_ROUTES } from './nav';
import './app.css';
import './Charts.css';
import './layout.css';
import './domain.css';

const KEY = 'monevo-sidebar-collapsed';

/* Authenticated shell: sidebar + topbar on desktop/tablet, topbar + bottom nav on phones. */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  });
  const { pathname } = useLocation();

  useEffect(() => { try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch { /* ignore */ } }, [collapsed]);

  useEffect(() => {
    const route = ALL_ROUTES.find(r => pathname.startsWith(r.to));
    document.title = `${route?.label ?? 'App'} · Monevo`;
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={`app${collapsed ? ' app--collapsed' : ''}`}>
      <a href="#main" className="skip-link">Skip to content</a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="app__main">
        <Topbar />
        <main id="main" className="app__content">
          <div className="app__container" key={pathname}><Outlet /></div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
