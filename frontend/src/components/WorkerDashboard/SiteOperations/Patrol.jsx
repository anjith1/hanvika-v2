import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

export default function Patrol() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ siteId: '', checkpoint: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/patrol`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setLogs(res.data.data || []);
        } catch { setLogs([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API}/api/patrol`, form, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setMsg('✅ Checkpoint logged!');
            setForm({ siteId: '', checkpoint: '', notes: '' });
            fetchLogs();
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.error || 'Failed to log checkpoint.'}`);
        } finally { setSubmitting(false); setTimeout(() => setMsg(''), 3000); }
    };

    return (
        <div className="wd-module">
            <div className="wd-module-header"><h3>🛡️ Patrol Log</h3></div>

            {/* Log form */}
            <form onSubmit={handleSubmit} className="wd-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input className="wd-input" placeholder="Site ID" value={form.siteId}
                        onChange={e => setForm(p => ({ ...p, siteId: e.target.value }))} required />
                    <input className="wd-input" placeholder="Checkpoint name" value={form.checkpoint}
                        onChange={e => setForm(p => ({ ...p, checkpoint: e.target.value }))} required />
                </div>
                <input className="wd-input" placeholder="Notes (optional)" value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                <button type="submit" className="wd-btn wd-btn-orange" disabled={submitting}>
                    {submitting ? 'Logging...' : '🛡️ Log Checkpoint'}
                </button>
            </form>

            {msg && <div className="wd-msg">{msg}</div>}

            {loading ? <div className="wd-loading">Loading patrol logs...</div> : (
                logs.length === 0 ? (
                    <div className="wd-empty">No patrol logs yet.</div>
                ) : (
                    <div className="wd-card-list">
                        {logs.map(l => (
                            <div key={l._id} className="wd-card" style={{ borderLeft: '3px solid #a855f7' }}>
                                <div className="wd-card-row">
                                    <span className="wd-card-title">📍 {l.checkpoint}</span>
                                    <span className="wd-card-sub">🏢 {l.siteId}</span>
                                </div>
                                {l.notes && <div className="wd-card-desc">{l.notes}</div>}
                                <div className="wd-card-date">{new Date(l.timestamp).toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
