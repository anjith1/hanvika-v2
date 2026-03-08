import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

const TYPE_OPTS = [
    { value: 'today', label: "📄 Today's Instructions", color: '#3b82f6' },
    { value: 'post', label: '📍 Post Instructions', color: '#f97316' },
    { value: 'job', label: '📑 Job Instructions', color: '#22c55e' },
];

export default function TodayInstructions({ type = 'today' }) {
    const [instructions, setInstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ siteId: '', title: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    const cfg = TYPE_OPTS.find(t => t.value === type) || TYPE_OPTS[0];

    useEffect(() => { fetch(); }, [type]);

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/site-instructions?type=${type}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setInstructions(res.data.data || []);
        } catch { setInstructions([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API}/api/site-instructions`, { ...form, instructionType: type }, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setMsg('✅ Instruction posted!');
            setForm({ siteId: '', title: '', description: '' });
            setShowForm(false);
            fetch();
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.error || 'Failed to post.'}`);
        } finally { setSubmitting(false); setTimeout(() => setMsg(''), 3000); }
    };

    return (
        <div className="wd-module">
            <div className="wd-module-header">
                <h3 style={{ color: cfg.color }}>{cfg.label}</h3>
                <button className="wd-btn-sm wd-btn-orange" onClick={() => setShowForm(p => !p)}>
                    {showForm ? 'Cancel' : '+ Post'}
                </button>
            </div>

            {msg && <div className="wd-msg">{msg}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="wd-form">
                    <input className="wd-input" placeholder="Site ID" value={form.siteId}
                        onChange={e => setForm(p => ({ ...p, siteId: e.target.value }))} required />
                    <input className="wd-input" placeholder="Title" value={form.title}
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                    <textarea className="wd-input wd-textarea" placeholder="Description..." value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                    <button type="submit" className="wd-btn wd-btn-orange" disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Instruction'}
                    </button>
                </form>
            )}

            {loading ? <div className="wd-loading">Loading...</div> : (
                instructions.length === 0 ? (
                    <div className="wd-empty">No instructions found.</div>
                ) : (
                    <div className="wd-card-list">
                        {instructions.map(i => (
                            <div key={i._id} className="wd-card">
                                <div className="wd-card-title">{i.title}</div>
                                {i.siteId && <div className="wd-card-sub">🏢 Site: {i.siteId}</div>}
                                {i.description && <div className="wd-card-desc">{i.description}</div>}
                                <div className="wd-card-date">{new Date(i.createdAt).toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
