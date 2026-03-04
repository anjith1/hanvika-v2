// frontend/src/components/Select.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Select.css';

const ROLES = [
  { id: 'partner', label: 'Service Partner', sub: 'Workers & Service Providers', icon: '👷', route: '/worker-login', accent: '#3b82f6', badge: null },
  { id: 'customer', label: 'Customer', sub: 'Businesses & Individuals', icon: '🏢', route: '/login', accent: '#22c55e', badge: null },
  { id: 'admin', label: 'Admin', sub: 'Hanvika Staff Only', icon: '🛡️', route: '/admin-login', accent: '#f97316', badge: 'RESTRICTED' },
];

export default function Select() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const handleNav = (action) => {
    if (action === 'home') return navigate('/');
    if (action === 'feedback') return navigate('/reviews');
    if (action === 'contact') return navigate('/contact');
    if (action === 'services') {
      navigate('/');
      setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  };

  return (
    <div className="sl">
      <div className="sl-bg">
        <div className="sl-orb sl-orb--1" />
        <div className="sl-orb sl-orb--2" />
        <div className="sl-grid" />
      </div>

      {/* Navbar */}
      <nav className="sl-nav">
        <div className="sl-nav-inner">
          <span className="sl-nav-logo" onClick={() => navigate('/')}>
            <div className="sl-mark">H</div>
            <span>HanVika</span>
          </span>
          <div className="sl-nav-links">
            {[['Home', 'home'], ['Services', 'services'], ['Feedback', 'feedback'], ['Contact', 'contact']].map(([l, a]) => (
              <button key={a} className="sl-nav-btn" onClick={() => handleNav(a)}>{l}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="sl-body">
        <div className="sl-head">
          <div className="sl-eyebrow">Welcome to Hanvika</div>
          <h1 className="sl-title">Choose Your Role</h1>
          <p className="sl-sub">Select how you'd like to access the platform</p>
        </div>

        <div className="sl-cards">
          {ROLES.map((r, i) => (
            <button
              key={r.id}
              className={`sl-card ${hovered === r.id ? 'sl-card--hov' : ''}`}
              style={{ '--accent': r.accent, animationDelay: `${i * 0.1}s` }}
              onClick={() => navigate(r.route)}
              onMouseEnter={() => setHovered(r.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {r.badge && <span className="sl-restricted">{r.badge}</span>}
              <div className="sl-card-icon" style={{ background: `${r.accent}22`, color: r.accent }}>
                {r.icon}
              </div>
              <div className="sl-card-text">
                <span className="sl-card-label">{r.label}</span>
                <span className="sl-card-sub">{r.sub}</span>
              </div>
              <span className="sl-card-arrow">→</span>
              <div className="sl-card-glow" style={{ background: r.accent }} />
            </button>
          ))}
        </div>

        <p className="sl-note">Admin access is restricted to authorized Hanvika personnel only.</p>
      </div>
    </div>
  );
}
