import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './Landing.css';

/* ---- Scroll reveal hook ---- */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.10 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ---- SVG Icons ---- */
const Icon = ({ name }) => {
  const icons = {
    tracking: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    dashboard: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    budget: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    savings: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    analytics: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    search: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    arrowUp: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    ),
    arrowDown: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

const FEATURES = [
  {
    icon: 'tracking',
    title: 'Income & Expense Tracking',
    desc: 'Track your income and expenses and organize your transactions with ease.',
  },
  {
    icon: 'dashboard',
    title: 'Financial Dashboard',
    desc: 'Get a clear overview of your balance, income, expenses and savings.',
  },
  {
    icon: 'budget',
    title: 'Budget Management',
    desc: 'Set monthly budgets and monitor your spending in real time.',
  },
  {
    icon: 'savings',
    title: 'Savings Goals',
    desc: 'Create savings goals and track your progress toward reaching them.',
  },
  {
    icon: 'analytics',
    title: 'Financial Analytics',
    desc: 'Understand your spending patterns through clear visual insights.',
  },
  {
    icon: 'search',
    title: 'Transaction Search',
    desc: 'Quickly find transactions by category, date, amount and type.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Track',
    desc: 'Add your income and expenses. Monevo automatically organizes and categorizes everything.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Plan',
    desc: 'Set monthly budgets and savings goals that fit your life and your financial timeline.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
        <line x1="8"  y1="14" x2="8.01" y2="14"/>
        <line x1="12" y1="14" x2="12.01" y2="14"/>
        <line x1="16" y1="14" x2="16.01" y2="14"/>
        <line x1="8"  y1="18" x2="8.01" y2="18"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Grow',
    desc: 'Understand your spending patterns through visual insights and make smarter decisions.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
];

const TRANSACTIONS = [
  { name: 'Groceries', category: 'Food & Dining', amount: '-₹2,200', type: 'neg' },
  { name: 'Freelance Payment', category: 'Income', amount: '+₹12,000', type: 'pos' },
  { name: 'Netflix', category: 'Subscriptions', amount: '-₹499', type: 'neg' },
];

/* ---- Dashboard Preview ---- */
function DashboardPreview() {
  return (
    <div className="preview" aria-label="Monevo dashboard preview" role="img">
      {/* Window chrome */}
      <div className="preview__chrome">
        <div className="preview__dots" aria-hidden="true">
          <span className="preview__dot preview__dot--red"/>
          <span className="preview__dot preview__dot--yellow"/>
          <span className="preview__dot preview__dot--green"/>
        </div>
        <span className="preview__window-title">Monevo</span>
      </div>

      {/* Balance header */}
      <div className="preview__balance">
        <div className="preview__balance-left">
          <p className="preview__label">Total Balance</p>
          <p className="preview__amount">₹25,500</p>
        </div>
        <div className="preview__badge">
          <Icon name="arrowUp"/>
          8.2% this month
        </div>
      </div>

      {/* Stats row */}
      <div className="preview__stats">
        <div className="preview__stat">
          <div className="preview__stat-icon preview__stat-icon--green">
            <Icon name="arrowUp"/>
          </div>
          <div>
            <p className="preview__stat-label">Income</p>
            <p className="preview__stat-value">₹40,000</p>
          </div>
        </div>
        <div className="preview__stat-divider"/>
        <div className="preview__stat">
          <div className="preview__stat-icon preview__stat-icon--red">
            <Icon name="arrowDown"/>
          </div>
          <div>
            <p className="preview__stat-label">Expenses</p>
            <p className="preview__stat-value">₹14,500</p>
          </div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="preview__budget">
        <div className="preview__budget-row">
          <span className="preview__budget-label">Monthly Budget</span>
          <span className="preview__budget-pct">63%</span>
        </div>
        <div className="preview__bar-track" role="progressbar" aria-valuenow={63} aria-valuemin={0} aria-valuemax={100}>
          <div className="preview__bar-fill"/>
        </div>
        <div className="preview__budget-sub">
          <span>₹9,135 spent</span>
          <span>₹14,500 limit</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="preview__txs">
        <p className="preview__txs-title">Recent Transactions</p>
        {TRANSACTIONS.map((tx, i) => (
          <div className="preview__tx" key={i}>
            <div className={`preview__tx-icon preview__tx-icon--${tx.type}`}>
              <Icon name={tx.type === 'pos' ? 'arrowUp' : 'arrowDown'}/>
            </div>
            <div className="preview__tx-info">
              <span className="preview__tx-name">{tx.name}</span>
              <span className="preview__tx-cat">{tx.category}</span>
            </div>
            <span className={`preview__tx-amount preview__tx-amount--${tx.type}`}>
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Landing ---- */
export default function Landing() {
  useScrollReveal();

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <main className="landing">

      {/* ================================================
          HERO
          ================================================ */}
      <section className="hero" id="home">
        <div className="container hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">Personal Finance Manager</p>
            <h1 className="hero__headline">
              Take Control of<br/>Your Money.
            </h1>
            <p className="hero__sub">
              Monevo helps you track your spending, manage budgets, build savings,
              and understand your financial habits — all in one simple dashboard.
            </p>
            <p className="hero__tagline">Track. Plan. Save. Grow.</p>
            <div className="hero__ctas">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => scrollTo('features')}
              >
                Explore Features
              </button>
            </div>
          </div>

          <div className="hero__visual">
            <DashboardPreview/>
          </div>
        </div>
      </section>

      {/* ================================================
          FEATURES
          ================================================ */}
      <section className="section features-section" id="features">
        <div className="container">
          <header className="section__header reveal">
            <p className="section__eyebrow">What Monevo offers</p>
            <h2 className="section__title">Everything you need to manage your money</h2>
            <p className="section__sub">Six powerful tools for better financial decisions.</p>
          </header>

          <div className="features-grid reveal-stagger">
            {FEATURES.map((f) => (
              <article className="feature-card" key={f.title}>
                <div className="feature-card__icon" aria-hidden="true">
                  <Icon name={f.icon}/>
                </div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          HOW IT WORKS
          ================================================ */}
      <section className="section how-section" id="how-it-works">
        <div className="container">
          <header className="section__header reveal">
            <p className="section__eyebrow">Simple process</p>
            <h2 className="section__title">How Monevo works</h2>
            <p className="section__sub">Three simple steps to financial clarity.</p>
          </header>

          <div className="how-steps reveal-stagger">
            {STEPS.map((step, i) => (
              <div className="how-step-wrapper" key={step.num}>
                <div className="how-step">
                  <div className="how-step__icon-wrap" aria-hidden="true">
                    <div className="how-step__icon">{step.icon}</div>
                    <div className="how-step__num">{step.num}</div>
                  </div>
                  <div className="how-step__body">
                    <h3 className="how-step__title">{step.title}</h3>
                    <p className="how-step__desc">{step.desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="how-step__arrow" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          ABOUT
          ================================================ */}
      <section className="section about-section" id="about">
        <div className="container">
          <div className="about-inner reveal">
            <div className="about-text">
              <p className="section__eyebrow">About Monevo</p>
              <h2 className="about-title">
                Your money.<br/>Your goals.<br/>Your Monevo.
              </h2>
              <p className="about-desc">
                Monevo brings your everyday financial information together in one
                organized place. Instead of keeping track of expenses manually,
                you can monitor your money, plan your budget, and work toward your
                savings goals from a single platform.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg">Start for free</Link>
            </div>
            <div className="about-stats">
              {[
                { val: '10k+', label: 'Active users' },
                { val: '₹4.2Cr', label: 'Total savings tracked' },
                { val: '4.9★', label: 'User satisfaction' },
                { val: '3 min', label: 'Daily check-in time' },
              ].map(s => (
                <div className="about-stat" key={s.label}>
                  <span className="about-stat__val">{s.val}</span>
                  <span className="about-stat__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          CTA
          ================================================ */}
      <section className="cta-section" id="contact">
        <div className="container cta-inner reveal">
          <h2 className="cta-title">Ready to take control<br/>of your finances?</h2>
          <p className="cta-sub">Start tracking, planning, and saving smarter with Monevo.</p>
          <Link to="/signup" className="btn btn-lg cta-btn">Get Started →</Link>
        </div>
      </section>

      <Footer/>
    </main>
  );
}
