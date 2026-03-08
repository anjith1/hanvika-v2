import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

const STATUS_COLOR = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };
const LEAVE_TYPES = ['sick', 'casual', 'earned', 'other'];

export default function LeaveRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/leave`, {
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
            await axios.post(`${API}/api/leave`, form, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setMsg('✅ Leave request submitted!');
            setForm({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' });
            setShowForm(false);
            fetchRequests();
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.error || 'Failed to submit.'}`);
        } finally { setSubmitting(false); setTimeout(() => setMsg(''), 3000); }
    };

    const daysBetween = (from, to) => {
        const diff = new Date(to) - new Date(from);
        return Math.max(1, Math.round(diff / 86400000) + 1);
    };

    return (
        <div className="wd-module">
            <div className="wd-module-header">
                <h3>📅 Leave Requests</h3>
                <button className="wd-btn-sm wd-btn-orange" onClick={() => setShowForm(p => !p)}>
                    {showForm ? 'Cancel' : '+ Apply'}
                </button>
            </div>

            {msg && <div className="wd-msg">{msg}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="wd-form">
                    <select className="wd-input" value={form.leaveType}
                        onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))}>
                        {LEAVE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>)}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                            <label className="wd-field-label">From Date</label>
                            <input className="wd-input" type="date" min={today} value={form.fromDate}
                                onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="wd-field-label">To Date</label>
                            <input className="wd-input" type="date" min={form.fromDate || today} value={form.toDate}
                                onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))} required />
                        </div>
                    </div>
                    {form.fromDate && form.toDate && (
                        <div className="wd-duration-pill">
                            📆 {daysBetween(form.fromDate, form.toDate)} day(s) leave
                        </div>
                    )}
                    <textarea className="wd-input wd-textarea" placeholder="Reason for leave..." value={form.reason}
                        onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={3} required />
                    <button type="submit" className="wd-btn wd-btn-orange" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Leave Request'}
                    </button>
                </form>
            )}

            {loading ? <div className="wd-loading">Loading...</div> : (
                requests.length === 0 ? (
                    <div className="wd-empty">No leave requests yet.</div>
                ) : (
                    <div className="wd-card-list">
                        {requests.map(r => (
                            <div key={r._id} className="wd-card">
                                <div className="wd-card-row">
                                    <span className="wd-card-title">{r.leaveType.toUpperCase()} LEAVE</span>
                                    <span className="wd-badge" style={{ background: STATUS_COLOR[r.status] + '22', color: STATUS_COLOR[r.status] }}>
                                        {r.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="wd-card-sub">
                                    {new Date(r.fromDate).toLocaleDateString('en-IN')} →{' '}
                                    {new Date(r.toDate).toLocaleDateString('en-IN')}
                                    {' '}({daysBetween(r.fromDate, r.toDate)} days)
                                </div>
                                <div className="wd-card-desc">{r.reason}</div>
                                {r.adminNote && <div className="wd-admin-note">📝 Admin: {r.adminNote}</div>}
                                <div className="wd-card-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
