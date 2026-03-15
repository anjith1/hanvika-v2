import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

const PRIORITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const STATUS_COLOR = { pending: '#f59e0b', 'in-progress': '#3b82f6', completed: '#22c55e' };

export default function Tasking() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ taskTitle: '', description: '', priority: 'medium', siteId: '' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/tasks`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setTasks(res.data.data || []);
        } catch { setTasks([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API}/api/tasks`, form, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setMsg('✅ Task created!');
            setForm({ taskTitle: '', description: '', priority: 'medium', siteId: '' });
            setShowForm(false);
            fetchTasks();
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.error || 'Failed to create task.'}`);
        } finally { setSubmitting(false); setTimeout(() => setMsg(''), 3000); }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`${API}/api/tasks/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchTasks();
        } catch (err) { console.error('Status update failed:', err.message); }
    };

    return (
        <div className="wd-module">
            <div className="wd-module-header">
                <h3>📋 My Tasks</h3>
                <button className="wd-btn-sm wd-btn-orange" onClick={() => setShowForm(p => !p)}>
                    {showForm ? 'Cancel' : '+ New Task'}
                </button>
            </div>

            {msg && <div className="wd-msg">{msg}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="wd-form">
                    <input className="wd-input" placeholder="Task title" value={form.taskTitle}
                        onChange={e => setForm(p => ({ ...p, taskTitle: e.target.value }))} required />
                    <input className="wd-input" placeholder="Site ID (optional)" value={form.siteId}
                        onChange={e => setForm(p => ({ ...p, siteId: e.target.value }))} />
                    <textarea className="wd-input wd-textarea" placeholder="Description..." value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                    <select className="wd-input" value={form.priority}
                        onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                    </select>
                    <button type="submit" className="wd-btn wd-btn-orange" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Task'}
                    </button>
                </form>
            )}

            {loading ? <div className="wd-loading">Loading tasks...</div> : (
                tasks.length === 0 ? (
                    <div className="wd-empty">No tasks assigned yet.</div>
                ) : (
                    <div className="wd-card-list">
                        {tasks.map(t => (
                            <div key={t._id} className="wd-card">
                                <div className="wd-card-row">
                                    <span className="wd-card-title">{t.taskTitle}</span>
                                    <span className="wd-badge" style={{ background: PRIORITY_COLOR[t.priority] + '22', color: PRIORITY_COLOR[t.priority] }}>
                                        {t.priority}
                                    </span>
                                    <span className="wd-badge" style={{ background: STATUS_COLOR[t.status] + '22', color: STATUS_COLOR[t.status] }}>
                                        {t.status}
                                    </span>
                                </div>
                                {t.description && <div className="wd-card-desc">{t.description}</div>}
                                {t.siteId && <div className="wd-card-sub">🏢 {t.siteId}</div>}
                                <div className="wd-card-actions">
                                    {t.status === 'pending' && (
                                        <button className="wd-btn-xs wd-btn-blue" onClick={() => updateStatus(t._id, 'in-progress')}>Start</button>
                                    )}
                                    {t.status === 'in-progress' && (
                                        <button className="wd-btn-xs wd-btn-green" onClick={() => updateStatus(t._id, 'completed')}>Complete ✓</button>
                                    )}
                                    {t.status === 'completed' && <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Done</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
