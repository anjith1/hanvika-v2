// frontend/src/components/WorkerSignup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './WorkerLogin.css'; // Reusing WorkerLogin styles since structure is identical

export default function WorkerSignup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

    const onSubmit = async e => {
        e.preventDefault();
        if (!form.username || !form.email || !form.phone || !form.password || !form.confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
            const res = await fetch(`${API}/api/worker-auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    phone: form.phone,
                    password: form.password
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

            // On success, redirect to login
            navigate('/worker-login');
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
                        <h1 className="wl-title">Worker Registration</h1>
                        <p className="wl-sub">Create your worker account</p>
                    </div>

                    <form onSubmit={onSubmit} className="wl-form" noValidate>
                        <div className="wl-field">
                            <label className="wl-label">Username</label>
                            <input className="wl-input" type="text" name="username"
                                value={form.username} onChange={onChange}
                                placeholder="johndoe" autoComplete="username" />
                        </div>

                        <div className="wl-field">
                            <label className="wl-label">Email</label>
                            <input className="wl-input" type="email" name="email"
                                value={form.email} onChange={onChange}
                                placeholder="your@email.com" autoComplete="email" />
                        </div>

                        <div className="wl-field">
                            <label className="wl-label">Phone Number</label>
                            <input className="wl-input" type="tel" name="phone"
                                value={form.phone} onChange={onChange}
                                placeholder="+1 (555) 123-4567" autoComplete="tel" />
                        </div>

                        <div className="wl-field">
                            <label className="wl-label">Password</label>
                            <div className="wl-pw-wrap">
                                <input className="wl-input" type={show ? 'text' : 'password'}
                                    name="password" value={form.password} onChange={onChange}
                                    placeholder="••••••••" autoComplete="new-password" />
                                <button type="button" className="wl-eye" onClick={() => setShow(p => !p)}>
                                    {show ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="wl-field">
                            <label className="wl-label">Confirm Password</label>
                            <div className="wl-pw-wrap">
                                <input className="wl-input" type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword" value={form.confirmPassword} onChange={onChange}
                                    placeholder="••••••••" autoComplete="new-password" />
                                <button type="button" className="wl-eye" onClick={() => setShowConfirm(p => !p)}>
                                    {showConfirm ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="wl-error"><span>⚠</span> {error}</div>}

                        <button type="submit" className="wl-submit" disabled={loading}>
                            {loading ? <span className="wl-spin" /> : 'Register →'}
                        </button>
                    </form>

                    <div className="wl-footer-links">
                        <p>Already registered? <Link to="/worker-login" className="wl-a">Sign In here</Link></p>
                        <p><Link to="/select" className="wl-a">← Choose Role</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
