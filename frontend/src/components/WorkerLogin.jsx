// frontend/src/components/WorkerLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './WorkerLogin.css';

export default function WorkerLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.identifier || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const res = await fetch(`${API}/api/worker-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: form.identifier, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('workerToken', data.token);
      localStorage.setItem('workerUser', JSON.stringify(data.user));
      navigate('/workers-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wl">
      <div className="wl-bg">
        <div className="wl-orb wl-orb--1" />
        <div className="wl-orb wl-orb--2" />
        <div className="wl-grid" />
      </div>

      <div className={`wl-wrap ${mounted ? 'wl-wrap--in' : ''}`}>
        <div className="wl-header">
          <Link to="/" className="wl-back">← Back</Link>
          <div className="wl-badge">Worker Portal</div>
        </div>

        <div className="wl-card">
          <div className="wl-card-top">
            <div className="wl-icon">👷</div>
            <h1 className="wl-title">Worker Sign In</h1>
            <p className="wl-sub">Access your worker dashboard</p>
          </div>

          <div className="wl-notice">
            <span>🔔</span>
            <span>New to Hanvika? Register first — accounts require admin approval before login.</span>
          </div>

          <form onSubmit={onSubmit} className="wl-form" noValidate>
            <div className="wl-field">
              <label className="wl-label">Email or Username</label>
              <input className="wl-input" type="text" name="identifier"
                value={form.identifier} onChange={onChange}
                placeholder="your@email.com" autoComplete="username" />
            </div>

            <div className="wl-field">
              <label className="wl-label">Password</label>
              <div className="wl-pw-wrap">
                <input className="wl-input" type={show ? 'text' : 'password'}
                  name="password" value={form.password} onChange={onChange}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" className="wl-eye" onClick={() => setShow(p => !p)}>
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="wl-error"><span>⚠</span> {error}</div>}

            <button type="submit" className="wl-submit" disabled={loading}>
              {loading ? <span className="wl-spin" /> : 'Sign In →'}
            </button>
          </form>

          <div className="wl-footer-links">
            <p>Not registered? <Link to="/worker-form" className="wl-a">Register as Worker</Link></p>
            <p>Are you a customer? <Link to="/login" className="wl-a">Customer Login</Link></p>
            <p><Link to="/select" className="wl-a">← Choose Role</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
