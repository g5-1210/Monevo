import { Link } from 'react-router-dom';
import './Footer.css';

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/>
    <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
    <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.45"/>
    <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>
  </svg>
);

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <Logo />
            <span>Monevo</span>
          </Link>
          <p className="footer__tagline">Simple tools for smarter personal finance.</p>
        </div>

        <nav className="footer__nav" aria-label="Footer navigation">
          <div className="footer__col">
            <p className="footer__col-title">Product</p>
            <button className="footer__link" onClick={() => scrollTo('features')}>Features</button>
            <button className="footer__link" onClick={() => scrollTo('how-it-works')}>How It Works</button>
            <button className="footer__link" onClick={() => scrollTo('about')}>About</button>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">Account</p>
            <Link to="/login" className="footer__link">Log In</Link>
            <Link to="/signup" className="footer__link">Sign Up</Link>
            <button className="footer__link" onClick={() => scrollTo('contact')}>Contact</button>
          </div>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">© 2026 Monevo. All rights reserved.</p>
          <p className="footer__made">Built for FEE Lab Evaluation</p>
        </div>
      </div>
    </footer>
  );
}
