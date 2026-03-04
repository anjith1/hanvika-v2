// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#080e17',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '32px 28px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', flexWrap: 'wrap', gap: 20,
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: '#f97316', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: '#fff', fontFamily: 'Syne, sans-serif',
          }}>H</div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            Hanvika Manpower Supply Pvt. Ltd.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[['/', 'Home'], ['/reviews', 'Feedback'], ['/contact', 'Contact'], ['/select', 'Login']].map(([to, l]) => (
            <Link key={to} to={to} style={{
              color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none',
              padding: '4px 10px', borderRadius: 6, transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
            >{l}</Link>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0 }}>
          © 2026 Hanvika. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
