import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

const STATUS_COLOR = { completed: '#22c55e', 'in-progress': '#3b82f6', assigned: '#f59e0b', pending: '#64748b' };

export default function Attendance() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAttendance(); }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/regularization/attendance`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setRecords(res.data.data || []);
        } catch { setRecords([]); }
        finally { setLoading(false); }
    };

    const present = records.filter(r => r.checkIn !== '—').length;
    const absent = records.filter(r => r.checkIn === '—').length;

    return (
        <div className="wd-module">
            <div className="wd-module-header"><h3>📊 Attendance Record</h3></div>

            {/* Summary pills */}
            <div className="wd-att-summary">
                <div className="wd-att-pill wd-att-present">✅ Present: {present}</div>
                <div className="wd-att-pill wd-att-absent">❌ Absent: {absent}</div>
                <div className="wd-att-pill">📋 Total: {records.length}</div>
            </div>

            {loading ? <div className="wd-loading">Loading attendance...</div> : (
                records.length === 0 ? (
                    <div className="wd-empty">No attendance records found.</div>
                ) : (
                    <div className="wd-table-wrap">
                        <table className="wd-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Service</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(r => (
                                    <tr key={r._id}>
                                        <td>{r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'}</td>
                                        <td>{r.service || '—'}</td>
                                        <td style={{ color: r.checkIn !== '—' ? '#22c55e' : '#ef4444' }}>{r.checkIn}</td>
                                        <td style={{ color: r.checkOut !== '—' ? '#3b82f6' : '#64748b' }}>{r.checkOut}</td>
                                        <td>{r.duration}</td>
                                        <td>
                                            <span className="wd-badge" style={{ background: (STATUS_COLOR[r.status] || '#64748b') + '22', color: STATUS_COLOR[r.status] || '#64748b' }}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}
