import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Features',     id: 'features'    },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'About',        id: 'about'        },
  { label: 'Contact',      id: 'contact'      },
];

/* ---- Sun icon ---- */
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

/* ---- Moon icon ---- */
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

/* ---- Theme Toggle ---- */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle${isDark ? ' theme-toggle--dark' : ''}`}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          <span className="theme-toggle__icon theme-toggle__icon--sun"><SunIcon /></span>
          <span className="theme-toggle__icon theme-toggle__icon--moon"><MoonIcon /></span>
        </span>
      </span>
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="banner">
        <div className="container navbar__inner">

          {/* Brand */}
          <Link to="/" className="navbar__brand" aria-label="Monevo home">
            <span className="navbar__logo" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3"  y="3"  width="8" height="8" rx="2" fill="currentColor"/>
                <rect x="13" y="3"  width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
                <rect x="3"  y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>
              </svg>
            </span>
            <span className="navbar__brand-name">Monevo</span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__nav" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <button key={link.id} className="navbar__link" onClick={() => scrollTo(link.id)}>
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="navbar__actions">
            <ThemeToggle />
            <Link to="/login"  className="btn btn-ghost btn-sm">Log In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>

          {/* Burger */}
          <button
            className={`navbar__burger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span aria-hidden="true"/><span aria-hidden="true"/><span aria-hidden="true"/>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-menu__nav" aria-label="Mobile navigation">
          {NAV_LINKS.map(link => (
            <button key={link.id} className="mobile-menu__link" onClick={() => scrollTo(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>
        <div className="mobile-menu__actions">
          <div className="mobile-menu__theme">
            <span className="mobile-menu__theme-label">
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
            <ThemeToggle />
          </div>
          <Link to="/login"  className="btn btn-secondary" style={{ width: '100%' }}>Log In</Link>
          <Link to="/signup" className="btn btn-primary"   style={{ width: '100%' }}>Get Started</Link>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
