import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

const STATUS_COLOR = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };

export default function Regularization() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ date: '', requestedCheckIn: '', requestedCheckOut: '', reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/regularization`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setRequests(res.data.data || []);
        } catch { setRequests([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API}/api/regularization`, form, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setMsg('✅ Regularization request submitted!');
            setForm({ date: '', requestedCheckIn: '', requestedCheckOut: '', reason: '' });
            setShowForm(false);
            fetchRequests();
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.error || 'Failed to submit.'}`);
        } finally { setSubmitting(false); setTimeout(() => setMsg(''), 3000); }
    };

    return (
        <div className="wd-module">
            <div className="wd-module-header">
                <h3>🔄 Attendance Regularization</h3>
                <button className="wd-btn-sm wd-btn-orange" onClick={() => setShowForm(p => !p)}>
                    {showForm ? 'Cancel' : '+ Request'}
                </button>
            </div>

            {msg && <div className="wd-msg">{msg}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="wd-form">
                    <div>
                        <label className="wd-field-label">Date to Regularize</label>
                        <input className="wd-input" type="date" max={today} value={form.date}
                            onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                            <label className="wd-field-label">Correct Check-in Time</label>
                            <input className="wd-input" type="time" value={form.requestedCheckIn}
                                onChange={e => setForm(p => ({ ...p, requestedCheckIn: e.target.value }))} />
                        </div>
                        <div>
                            <label className="wd-field-label">Correct Check-out Time</label>
                            <input className="wd-input" type="time" value={form.requestedCheckOut}
                                onChange={e => setForm(p => ({ ...p, requestedCheckOut: e.target.value }))} />
                        </div>
                    </div>
                    <textarea className="wd-input wd-textarea" placeholder="Reason for correction (e.g. forgot to check in)..."
                        value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={3} required />
                    <button type="submit" className="wd-btn wd-btn-orange" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Regularization'}
                    </button>
                </form>
            )}

            {loading ? <div className="wd-loading">Loading...</div> : (
                requests.length === 0 ? (
                    <div className="wd-empty">No regularization requests yet.</div>
                ) : (
                    <div className="wd-card-list">
                        {requests.map(r => (
                            <div key={r._id} className="wd-card">
                                <div className="wd-card-row">
                                    <span className="wd-card-title">{new Date(r.date).toLocaleDateString('en-IN')}</span>
                                    <span className="wd-badge" style={{ background: STATUS_COLOR[r.status] + '22', color: STATUS_COLOR[r.status] }}>
                                        {r.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="wd-card-sub">
                                    {r.requestedCheckIn && `🟢 In: ${r.requestedCheckIn}`}
                                    {r.requestedCheckIn && r.requestedCheckOut && '  '}
                                    {r.requestedCheckOut && `🔵 Out: ${r.requestedCheckOut}`}
                                </div>
                                <div className="wd-card-desc">{r.reason}</div>
                                {r.adminNote && <div className="wd-admin-note">📝 Admin: {r.adminNote}</div>}
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
