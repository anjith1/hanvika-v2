// frontend/src/components/WorkerSection.jsx
// Full Lovable-style home page — standalone, no sidebar, no outer navbar
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './WorkerSection.css';

const SERVICES = [
  { id: 'acRepair', icon: '❄️', name: 'AC Repair', desc: 'Installation, repair & maintenance', workers: '320+ workers' },
  { id: 'mechanicRepair', icon: '🔧', name: 'Mechanic Repair', desc: 'Auto repairs with quality parts', workers: '280+ workers' },
  { id: 'electricalRepair', icon: '⚡', name: 'Electrical Repair', desc: 'Licensed electricians, all needs', workers: '240+ workers' },
  { id: 'electronicRepair', icon: '📺', name: 'Electronics Repair', desc: 'Gadgets & appliances fixed fast', workers: '190+ workers' },
  { id: 'plumber', icon: '🚰', name: 'Plumbing Services', desc: 'Pipes, leaks & sanitation systems', workers: '210+ workers' },
  { id: 'packersMovers', icon: '📦', name: 'Packers & Movers', desc: 'Professional moving & packing', workers: '160+ workers' },
  { id: 'security', icon: '🔒', name: 'Security Guards', desc: 'Trained, verified security staff', workers: '800+ workers' },
  { id: 'housekeeping', icon: '🏠', name: 'Housekeeping Staff', desc: 'Professional cleaning & upkeep', workers: '450+ workers' },
];

const STATS = [
  { val: '2,500+', label: 'Workers Deployed' },
  { val: '500+', label: 'Happy Clients' },
  { val: '15+', label: 'Cities Covered' },
  { val: '48hr', label: 'Avg. Deploy Time' },
];

const WHY = [
  { icon: '✅', title: 'BGV Verified', desc: 'All workers are background verified with police clearance.' },
  { icon: '⚡', title: '48hr Deployment', desc: 'Workers deployed within 48 hours of confirmed booking.' },
  { icon: '📍', title: 'GPS Tracked', desc: 'Real-time attendance & location tracking during duty hours.' },
  { icon: '🎓', title: 'Trained Staff', desc: 'Regular training and performance monitoring for all staff.' },
];

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function useCount(target, duration, trigger) {
  const [n, setN] = useState('0');
  useEffect(() => {
    if (!trigger) return;
    const num = parseInt(target.replace(/\D/g, '')) || 0;
    if (!num) { setN(target); return; }
    let cur = 0;
    const step = num / (duration / 16);
    const id = setInterval(() => {
      cur = Math.min(cur + step, num);
      const suffix = target.replace(/[\d,]/g, '');
      setN(Math.floor(cur).toLocaleString('en-IN') + suffix);
      if (cur >= num) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [trigger]);
  return n;
}

function StatCard({ val, label, delay, trigger }) {
  const n = useCount(val, 1400, trigger);
  return (
    <div className="hs-stat" style={{ animationDelay: `${delay}ms` }}>
      <span className="hs-stat-v">{n}</span>
      <span className="hs-stat-l">{label}</span>
    </div>
  );
}

export default function WorkerSection() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [heroRef, heroVis] = useInView(0.05);
  const [statRef, statVis] = useInView(0.2);
  const [svcRef, svcVis] = useInView(0.08);
  const [whyRef, whyVis] = useInView(0.08);
  const [ctaRef, ctaVis] = useInView(0.1);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="hs">

      {/* NAVBAR */}
      <header className={`hs-nav ${scrolled ? 'hs-nav--solid' : ''}`}>
        <div className="hs-nav-inner">
          <div className="hs-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="hs-logo-mark">H</div>
            <span>Hanvika Manpower</span>
          </div>

          <nav className={`hs-nav-links ${menuOpen ? 'hs-nav-links--open' : ''}`}>
            <button className="hs-nav-btn" onClick={() => scrollTo('services')}>Services</button>
            <button className="hs-nav-btn" onClick={() => scrollTo('why')}>Why Us</button>
            <button className="hs-nav-btn" onClick={() => scrollTo('contact')}>Contact</button>
            <Link to="/reviews" className="hs-nav-btn" onClick={() => setMenuOpen(false)}>Feedback</Link>
          </nav>

          <div className="hs-nav-right">
            <Link to="/select" className="hs-login-btn">Login / Register</Link>
            <button className={`hs-burger ${menuOpen ? 'hs-burger--x' : ''}`} onClick={() => setMenuOpen(p => !p)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hs-hero" ref={heroRef}>
        <div className="hs-hero-bg">
          <div className="hs-orb hs-orb--1" />
          <div className="hs-orb hs-orb--2" />
          <div className="hs-grid-overlay" />
        </div>

        <div className="hs-hero-body">
          {/* Left */}
          <div className={`hs-hero-left ${heroVis ? 'hs-fadein' : ''}`}>
            <div className="hs-trust-pill">
              <span className="hs-pulse-dot" />
              Trusted by 500+ businesses across Telangana
            </div>

            <h1 className="hs-h1">
              Reliable<br />
              <span className="hs-orange">Manpower</span><br />
              Solutions for<br />Your Business
            </h1>

            <p className="hs-hero-sub">
              Verified workers, GPS-tracked attendance, deployed within 48 hours.
              Serving Telangana &amp; Andhra Pradesh since 2014.
            </p>

            <div className="hs-hero-btns">
              <Link to="/select" className="hs-btn hs-btn--orange">Request Workers <span>→</span></Link>
              <a href="https://wa.me/919515029658?text=Hi%2C+I+need+manpower" target="_blank" rel="noopener noreferrer" className="hs-btn hs-btn--ghost">
                <span>💬</span> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right — info card */}
          <div className={`hs-hero-right ${heroVis ? 'hs-fadein-r' : ''}`}>
            <div className="hs-card-stack">
              <div className="hs-card-bg hs-card-bg--2" />
              <div className="hs-card-bg hs-card-bg--1" />
              <div className="hs-main-card">
                <div className="hs-card-header">
                  <div className="hs-card-ava">N</div>
                  <div>
                    <span className="hs-card-name">Narasimha Reddy</span>
                    <span className="hs-card-role">Operations Director</span>
                  </div>
                  <div className="hs-live-pill"><span className="hs-pulse-dot" />Live</div>
                </div>
                <div className="hs-card-grid">
                  {[['2,500+', 'Workers'], ['500+', 'Clients'], ['48hr', 'Deploy'], ['10yr', 'Experience']].map(([v, l]) => (
                    <div key={l} className="hs-card-cell">
                      <span className="hs-card-cv">{v}</span>
                      <span className="hs-card-cl">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="hs-card-loc">📍 Hyderabad, Telangana — 500070</div>
              </div>
            </div>
            <div className="hs-badge hs-badge--tl">✅ BGV Verified</div>
            <div className="hs-badge hs-badge--br">⚡ 48hr Deploy</div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hs-stats-bar" ref={statRef}>
          <div className="hs-stats-inner">
            {STATS.map((s, i) => (
              <StatCard key={s.label} val={s.val} label={s.label} delay={i * 80} trigger={statVis} />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="hs-section" ref={svcRef}>
        <div className="hs-wrap">
          <div className={`hs-section-hd ${svcVis ? 'hs-fadein' : ''}`}>
            <span className="hs-eyebrow">What We Offer</span>
            <h2 className="hs-h2">Our Services</h2>
            <p className="hs-h2-sub">Comprehensive manpower across multiple categories — tailored to your business.</p>
          </div>
          <div className="hs-svc-grid">
            {SERVICES.map((s, i) => (
              <Link
                key={s.id}
                to={`/create-request?service=${s.id}`}
                className={`hs-svc-card ${svcVis ? 'hs-card-in' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="hs-svc-icon">{s.icon}</span>
                <span className="hs-svc-name">{s.name}</span>
                <span className="hs-svc-desc">{s.desc}</span>
                <span className="hs-svc-workers">{s.workers}</span>
                <span className="hs-svc-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="hs-section hs-section--dark" ref={whyRef}>
        <div className="hs-wrap">
          <div className={`hs-section-hd ${whyVis ? 'hs-fadein' : ''}`}>
            <span className="hs-eyebrow">Our Edge</span>
            <h2 className="hs-h2">Why Choose Hanvika?</h2>
            <p className="hs-h2-sub">Technology-driven operations with human-first service delivery.</p>
          </div>
          <div className="hs-why-grid">
            {WHY.map((w, i) => (
              <div key={w.title} className={`hs-why-card ${whyVis ? 'hs-card-in' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="hs-why-icon">{w.icon}</div>
                <h3 className="hs-why-title">{w.title}</h3>
                <p className="hs-why-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="hs-section" ref={ctaRef}>
        <div className="hs-wrap">
          <div className={`hs-cta-box ${ctaVis ? 'hs-fadein' : ''}`}>
            <div className="hs-cta-glow" />
            <span className="hs-eyebrow" style={{ color: '#fdba74', borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)' }}>
              Get Started Today
            </span>
            <h2 className="hs-cta-h2">Ready to Scale Your Workforce?</h2>
            <p className="hs-cta-sub">Join 500+ businesses who trust Hanvika. Fast deployment. Verified workers. Zero hassle.</p>
            <div className="hs-cta-btns">
              <Link to="/select" className="hs-btn hs-btn--orange">Get Started Free →</Link>
              <a href="tel:+919515029658" className="hs-btn hs-btn--outline">📞 +91 95150 29658</a>
            </div>
            <div className="hs-cta-info">
              <span>📧 nreddy1624@gmail.com</span>
              <span>📍 Mansoorabad, Hyderabad</span>
              <span>📱 +91 90142 49345</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hs-footer">
        <div className="hs-footer-inner">
          <div className="hs-logo" style={{ justifyContent: 'center' }}>
            <div className="hs-logo-mark">H</div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Hanvika Manpower Supply Pvt. Ltd.</span>
          </div>
          <p className="hs-footer-copy">© 2026 All rights reserved. Hyderabad, Telangana, India</p>
          <div className="hs-footer-links">
            {[['services', 'Services'], ['why', 'Why Us'], ['contact', 'Contact']].map(([id, l]) => (
              <button key={id} className="hs-footer-btn" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <Link to="/reviews" className="hs-footer-btn">Feedback</Link>
            <Link to="/select" className="hs-footer-btn">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
