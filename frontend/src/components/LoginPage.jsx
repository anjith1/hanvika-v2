// frontend/src/components/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate('/customer/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.identifier || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: form.identifier, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Login failed');
      login(data.token, data.user);
      const role = data.user?.role || 'USER';
      if (role === 'WORKER') navigate('/workers-dashboard', { replace: true });
      else if (role === 'ADMIN') navigate('/admin', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp">
      {/* Animated background */}
      <div className="lp-bg">
        <div className="lp-orb lp-orb--1" />
        <div className="lp-orb lp-orb--2" />
        <div className="lp-grid" />
      </div>

      <div className={`lp-card ${mounted ? 'lp-card--in' : ''}`}>
        {/* Left panel */}
        <div className="lp-left">
          <div className="lp-mark">H</div>
          <h1 className="lp-brand">Hanvika</h1>
          <p className="lp-tagline">Reliable manpower.<br />Trusted by 500+ businesses.</p>
          <div className="lp-dots">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="lp-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <div className="lp-stats">
            {[['2500+', 'Workers'], ['500+', 'Clients'], ['48hr', 'Deploy']].map(([v, l]) => (
              <div key={l} className="lp-stat">
                <span className="lp-stat-v">{v}</span>
                <span className="lp-stat-l">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="lp-right">
          <div className="lp-form-head">
            <h2 className="lp-form-title">Welcome back</h2>
            <p className="lp-form-sub">Sign in to your customer account</p>
          </div>

          <form onSubmit={onSubmit} className="lp-form" noValidate>
            <div className="lp-field">
              <label className="lp-label">Email or Username</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">◉</span>
                <input
                  className="lp-input" type="text" name="identifier"
                  value={form.identifier} onChange={onChange}
                  placeholder="you@example.com" autoComplete="username"
                />
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">◈</span>
                <input
                  className="lp-input"
                  type={show ? 'text' : 'password'}
                  name="password" value={form.password} onChange={onChange}
                  placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" className="lp-eye" onClick={() => setShow(p => !p)}>
                  {show ? '◑' : '◐'}
                </button>
              </div>
            </div>

            {error && <div className="lp-error"><span>⚠</span> {error}</div>}

            <button type="submit" className="lp-submit" disabled={loading}>
              {loading ? <span className="lp-spinner" /> : 'Sign In →'}
            </button>
          </form>

          <div className="lp-divider"><span>or</span></div>

          <div className="lp-links">
            <p>Not registered? <Link to="/select" className="lp-anchor">Create account</Link></p>
            <p>Are you a worker? <Link to="/worker-login" className="lp-anchor">Worker login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
