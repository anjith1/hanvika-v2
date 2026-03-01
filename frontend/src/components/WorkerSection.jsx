// frontend/src/components/WorkerSection.jsx
// HOME PAGE — Lovable-style design, pure JS React, no TypeScript, no Tailwind
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './WorkerSection.css';

// DATA
const NAV_LINKS = ['Services', 'Why Us', 'Contact'];

const STATS = [
  { value: '2500', suffix: '+', label: 'Workers Deployed' },
  { value: '500', suffix: '+', label: 'Happy Clients' },
  { value: '15', suffix: '+', label: 'Cities Covered' },
  { value: '10', suffix: '+', label: 'Years Experience' },
];

const SERVICES = [
  { icon: '🔒', name: 'Security Guards', workers: '800+ workers' },
  { icon: '🏗️', name: 'Construction Labour', workers: '600+ workers' },
  { icon: '🏠', name: 'Housekeeping Staff', workers: '450+ workers' },
  { icon: '⚙️', name: 'Technical Manpower', workers: '300+ workers' },
  { icon: '📦', name: 'Warehouse & Logistics', workers: '250+ workers' },
  { icon: '🍽️', name: 'Hospitality Staff', workers: '200+ workers' },
  { icon: '🌿', name: 'Facility Management', workers: '180+ workers' },
  { icon: '🚗', name: 'Driver & Transport', workers: '220+ workers' },
];

const FEATURES = [
  { icon: '✅', title: 'Verified Workforce', desc: 'All workers background-verified with complete documentation and police clearance.' },
  { icon: '⚡', title: 'Quick Deployment', desc: 'Workers deployed within 24–48 hours of confirmed request, 7 days a week.' },
  { icon: '📍', title: 'GPS Tracked', desc: 'Real-time attendance and location tracking during all duty hours.' },
  { icon: '🎓', title: 'Quality Assured', desc: 'Regular training and performance monitoring of all staff members.' },
];

// HOOKS
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCountUp(target, duration, trigger) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!trigger) return;
    const num = parseInt(target, 10);
    let start = 0;
    const step = num / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, num);
      setDisplay(Math.floor(start).toLocaleString('en-IN'));
      if (start >= num) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [trigger, target, duration]);
  return display;
}

function StatCard({ value, suffix, label, delay, trigger }) {
  const count = useCountUp(value, 1400, trigger);
  return (
    <div className="hp-stat" style={{ animationDelay: `${delay}ms` }}>
      <span className="hp-stat-val">{count}{suffix}</span>
      <span className="hp-stat-lbl">{label}</span>
    </div>
  );
}

// MAIN
export default function WorkerSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [heroRef, heroVis] = useInView(0.05);
  const [statRef, statVis] = useInView(0.2);
  const [svcRef, svcVis] = useInView(0.1);
  const [featRef, featVis] = useInView(0.1);
  const [ctaRef, ctaVis] = useInView(0.1);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="hp">

      {/* NAV */}
      <header className={`hp-nav ${scrolled ? 'hp-nav--solid' : ''}`}>
        <div className="hp-nav-inner">
          <div className="hp-logo">
            <div className="hp-logo-badge">H</div>
            <span>Hanvika Manpower</span>
          </div>

          <nav className={`hp-nav-menu ${menuOpen ? 'hp-nav-menu--open' : ''}`}>
            {NAV_LINKS.map(l => (
              <button key={l} className="hp-nav-btn"
                onClick={() => scroll(l.toLowerCase().replace(' ', '-'))}>
                {l}
              </button>
            ))}
          </nav>

          <div className="hp-nav-right">
            <Link to="/select" className="hp-pill-btn">Login / Register</Link>
            <button className={`hp-burger ${menuOpen ? 'hp-burger--x' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hp-hero" ref={heroRef}>
        <div className="hp-hero-bg">
          <div className="hp-hero-orb hp-hero-orb--1" />
          <div className="hp-hero-orb hp-hero-orb--2" />
          <div className="hp-hero-grid" />
        </div>

        <div className="hp-hero-body">
          {/* Left text */}
          <div className={`hp-hero-left ${heroVis ? 'hp-anim-in' : ''}`}>
            <div className="hp-trust-pill">
              <span className="hp-trust-dot" />
              Trusted by 500+ businesses across Telangana
            </div>

            <h1 className="hp-hero-h1">
              Reliable <span className="hp-highlight">Manpower</span><br />
              Solutions for<br />Your Business
            </h1>

            <p className="hp-hero-sub">
              From security guards to skilled labour — verified, GPS-tracked,
              and deployed within 48 hours. Serving Telangana &amp; Andhra Pradesh.
            </p>

            <div className="hp-hero-btns">
              <Link to="/select" className="hp-cta-btn hp-cta-btn--orange">
                Request Workers <span className="hp-arrow">→</span>
              </Link>
              <a
                href="https://wa.me/919515029658?text=Hi%2C%20I%20need%20manpower%20services"
                target="_blank" rel="noopener noreferrer"
                className="hp-cta-btn hp-cta-btn--glass"
              >
                <span>💬</span> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right floating card */}
          <div className={`hp-hero-right ${heroVis ? 'hp-anim-in-right' : ''}`}>
            <div className="hp-card-wrap">
              <div className="hp-card-shadow hp-card-shadow--2" />
              <div className="hp-card-shadow hp-card-shadow--1" />
              <div className="hp-main-card">
                <div className="hp-card-top">
                  <div className="hp-card-avatar">N</div>
                  <div className="hp-card-meta">
                    <span className="hp-card-name">Narasimha Reddy</span>
                    <span className="hp-card-role">Operations Director</span>
                  </div>
                  <span className="hp-live-badge">
                    <span className="hp-live-pulse" /> Live
                  </span>
                </div>
                <div className="hp-card-grid">
                  {[['2,500+', 'Workers'], ['500+', 'Clients'], ['48hr', 'Deploy'], ['10yr', 'Experience']].map(([v, l]) => (
                    <div key={l} className="hp-card-cell">
                      <span className="hp-card-num">{v}</span>
                      <span className="hp-card-lbl">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="hp-card-location">
                  <span>📍</span> Hyderabad, Telangana — 500070
                </div>
              </div>
            </div>

            <div className="hp-float-badge hp-float-badge--tl">
              <span>✅</span> BGV Verified
            </div>
            <div className="hp-float-badge hp-float-badge--br">
              <span>⚡</span> 48hr Deploy
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hp-stats-row" ref={statRef}>
          <div className="hp-stats-inner">
            {STATS.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 80} trigger={statVis} />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="hp-section" ref={svcRef}>
        <div className="hp-section-wrap">
          <div className={`hp-section-hd ${svcVis ? 'hp-anim-in' : ''}`}>
            <span className="hp-eyebrow">What We Offer</span>
            <h2 className="hp-section-h2">Our Services</h2>
            <p className="hp-section-sub">
              Comprehensive manpower solutions across multiple categories, tailored to your business.
            </p>
          </div>
          <div className="hp-svc-grid">
            {SERVICES.map((s, i) => (
              <Link to="/select" key={s.name}
                className={`hp-svc-card ${svcVis ? 'hp-anim-card' : ''}`}
                style={{ animationDelay: `${i * 55}ms` }}>
                <span className="hp-svc-icon">{s.icon}</span>
                <span className="hp-svc-name">{s.name}</span>
                <span className="hp-svc-count">{s.workers}</span>
                <span className="hp-svc-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="why-us" className="hp-section hp-section--bg" ref={featRef}>
        <div className="hp-section-wrap">
          <div className={`hp-section-hd ${featVis ? 'hp-anim-in' : ''}`}>
            <span className="hp-eyebrow">Our Edge</span>
            <h2 className="hp-section-h2">Why Choose Hanvika?</h2>
            <p className="hp-section-sub">
              Industry-leading manpower management with technology-driven operations.
            </p>
          </div>
          <div className="hp-feat-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`hp-feat-card ${featVis ? 'hp-anim-card' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="hp-feat-icon">{f.icon}</div>
                <h3 className="hp-feat-title">{f.title}</h3>
                <p className="hp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="hp-section" ref={ctaRef}>
        <div className="hp-section-wrap">
          <div className={`hp-cta-box ${ctaVis ? 'hp-anim-in' : ''}`}>
            <div className="hp-cta-orb" />
            <span className="hp-eyebrow" style={{ color: '#fdba74', borderColor: '#f9731640', background: 'rgba(249,115,22,0.08)' }}>
              Get Started Today
            </span>
            <h2 className="hp-cta-h2">Ready to Scale Your Workforce?</h2>
            <p className="hp-cta-sub">
              Join 500+ businesses who trust Hanvika for their manpower needs.<br />
              Fast deployment. Verified workers. Zero hassle.
            </p>
            <div className="hp-cta-btns">
              <Link to="/select" className="hp-cta-btn hp-cta-btn--orange">
                Get Started Free →
              </Link>
              <a href="tel:+919515029658" className="hp-cta-btn hp-cta-btn--outline">
                📞 +91 95150 29658
              </a>
            </div>
            <div className="hp-cta-info">
              <span>📧 nreddy1624@gmail.com</span>
              <span>📍 Mansoorabad, Hyderabad — 500070</span>
              <span>📱 +91 90142 49345</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-logo" style={{ justifyContent: 'center' }}>
            <div className="hp-logo-badge">H</div>
            <span className="hp-footer-brand">Hanvika Manpower Supply Pvt. Ltd.</span>
          </div>
          <p className="hp-footer-copy">© 2026 All rights reserved. Hyderabad, Telangana, India</p>
          <div className="hp-footer-nav">
            {['services', 'why-us', 'contact'].map(id => (
              <button key={id} className="hp-footer-link" onClick={() => scroll(id)}>
                {id.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
            <Link to="/select" className="hp-footer-link">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
