import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

export default function MissedAttendance() {
    const [missed, setMissed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState({});

    useEffect(() => { fetchMissed(); }, []);

    const fetchMissed = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/regularization/missed`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setMissed(res.data.data || []);
        } catch { setMissed([]); }
        finally { setLoading(false); }
    };

    const handleRequestRegularization = async (job) => {
        try {
            await axios.post(`${API}/api/regularization`, {
                date: job.preferredDate,
                reason: `Missed check-in for ${job.serviceType} at ${job.location}`,
            }, { headers: { Authorization: `Bearer ${getToken()}` } });
            setSubmitted(p => ({ ...p, [job._id]: true }));
        } catch (err) {
            console.error('Regularization failed:', err.message);
        }
    };

    return (
        <div className="wd-module">
            <div className="wd-module-header"><h3>⚠️ Missed Attendance</h3></div>

            {!loading && missed.length > 0 && (
                <div className="wd-alert-banner">
                    ⚠️ You have {missed.length} assignment(s) with no check-in recorded.
                </div>
            )}

            {loading ? <div className="wd-loading">Checking for missed attendance...</div> : (
                missed.length === 0 ? (
                    <div className="wd-empty" style={{ color: '#22c55e' }}>
                        ✅ No missed attendance detected!
                    </div>
                ) : (
                    <div className="wd-card-list">
                        {missed.map(job => (
                            <div key={job._id} className="wd-card wd-card-warning">
                                <div className="wd-card-row">
                                    <span className="wd-card-title">⚠️ {job.serviceType}</span>
                                    <span className="wd-badge wd-badge-warning">NO CHECK-IN</span>
                                </div>
                                <div className="wd-card-sub">📍 {job.location}</div>
                                <div className="wd-card-sub">
                                    📅 {new Date(job.preferredDate).toLocaleDateString('en-IN')}
                                </div>
                                <div className="wd-card-actions">
                                    {submitted[job._id] ? (
                                        <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Regularization submitted</span>
                                    ) : (
                                        <button className="wd-btn-xs wd-btn-orange"
                                            onClick={() => handleRequestRegularization(job)}>
                                            Request Regularization
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
