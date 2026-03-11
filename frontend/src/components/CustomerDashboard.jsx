import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './CustomerDashboard.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper: extract location display values from both old string and new object format
const getLocationInfo = (location) => {
    if (!location) return { address: 'N/A', coords: null };
    if (typeof location === 'string') return { address: location, coords: null };
    return {
        address: location.address || 'N/A',
        coords: location.coordinates && location.coordinates.lat && location.coordinates.lng
            ? [location.coordinates.lat, location.coordinates.lng]
            : null
    };
};

const serviceLabels = {
    acRepair: 'AC Repair', mechanicRepair: 'Mechanic Repair',
    electricalRepair: 'Electrical Repair', electronicRepair: 'Electronics Repair',
    plumber: 'Plumbing', packersMovers: 'Packers & Movers'
};

const serviceEmojis = {
    acRepair: '❄️', mechanicRepair: '🔧', electricalRepair: '⚡',
    electronicRepair: '📱', plumber: '🔩', packersMovers: '📦'
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
];

const CustomerDashboard = () => {
    const { authToken, currentUser } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    // Rebuilt Reviews System
    const [reviewedIds, setReviewedIds] = useState(new Set());
    const [reviewModal, setReviewModal] = useState(null); // request object
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003';
            const response = await axios.get(`${apiUrl}/api/requests/my`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setRequests(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load your service requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchRequests();
            fetchReviewedJobs();
        }
    }, [authToken]);

    const fetchReviewedJobs = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003';
            const response = await axios.get(`${apiUrl}/api/reviews/my`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setReviewedIds(new Set(response.data.reviewedIds || []));
        } catch (err) {
            console.error('Error fetching reviewed jobs:', err);
        }
    };

    const submitReview = async () => {
        setSubmitting(true);
        setReviewError("");
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003';
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const res = await fetch(`${apiUrl}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    workerId: reviewModal.assignedWorker?._id || reviewModal.assignedWorker,
                    workerName: reviewModal.assignedWorker?.username || "Worker",
                    workerPhone: reviewModal.assignedWorker?.phone || "",
                    requestId: reviewModal._id,
                    serviceType: reviewModal.serviceType,
                    rating,
                    comment,
                    customerName: user.name || user.username || "Customer",
                    jobDate: reviewModal.checkOutTime,
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Mark as reviewed
            setReviewedIds(prev => new Set([...prev, reviewModal._id]));
            setReviewModal(null);
            setRating(5);
            setComment("");
        } catch (err) {
            setReviewError(err.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    // Derived counts
    const safeReqs = Array.isArray(requests) ? requests : [];
    const totalCount = safeReqs.length;
    const completedCount = safeReqs.filter(r => r.status === 'completed').length;
    const pendingCount = safeReqs.filter(r => r.status === 'pending').length;

    // Filtered list
    const filtered = activeFilter === 'all'
        ? safeReqs
        : safeReqs.filter(r => r.status === activeFilter);

    return (
        <div className="cd">

            {/* ── HEADER ─────────────────────────────────── */}
            <header className="cd-header">
                <div className="cd-header-left">
                    <h1 className="cd-title">My Service Requests</h1>
                    <p className="cd-subtitle">Track and manage all your service bookings</p>
                </div>
                <div className="cd-header-right">
                    <button className="cd-bell" title="Notifications">🔔</button>
                    <Link to="/create-request" className="cd-new-req">+ <span>New Request</span></Link>
                </div>
            </header>

            <div className="cd-content">

                {/* ── ERROR ───────────────────────────────── */}
                {error && <div className="cd-error">{error}</div>}

                {/* ── STATS ROW ───────────────────────────── */}
                <div className="cd-stats">
                    <div className="cd-stat cd-stat--total">
                        <span className="cd-stat-icon">📋</span>
                        <div className="cd-stat-info">
                            <span className="cd-stat-count">{totalCount}</span>
                            <span className="cd-stat-label">Total Requests</span>
                        </div>
                    </div>
                    <div className="cd-stat cd-stat--done">
                        <span className="cd-stat-icon">✅</span>
                        <div className="cd-stat-info">
                            <span className="cd-stat-count">{completedCount}</span>
                            <span className="cd-stat-label">Completed</span>
                        </div>
                    </div>
                    <div className="cd-stat cd-stat--pending">
                        <span className="cd-stat-icon">⏳</span>
                        <div className="cd-stat-info">
                            <span className="cd-stat-count">{pendingCount}</span>
                            <span className="cd-stat-label">Pending</span>
                        </div>
                    </div>
                </div>

                {/* ── FILTER TABS ─────────────────────────── */}
                <div className="cd-filters">
                    {FILTERS.map(f => (
                        <button key={f.key}
                            className={`cd-filter ${activeFilter === f.key ? 'cd-filter--active' : ''}`}
                            onClick={() => setActiveFilter(f.key)}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* ── LOADING SKELETONS ───────────────────── */}
                {loading ? (
                    <div className="cd-skeletons">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="cd-skeleton" />
                        ))}
                    </div>

                    /* ── EMPTY STATE ──────────────────────────── */
                ) : filtered.length === 0 ? (
                    <div className="cd-empty">
                        <span className="cd-empty-icon">📋</span>
                        <h3>{activeFilter === 'all' ? 'No requests yet' : `No ${activeFilter} requests`}</h3>
                        <p>{activeFilter === 'all' ? 'Book your first service to get started' : 'Try a different filter'}</p>
                        {activeFilter === 'all' && (
                            <Link to="/create-request" className="cd-empty-btn">+ Book a Service</Link>
                        )}
                    </div>

                    /* ── REQUEST CARDS ────────────────────────── */
                ) : (
                    <div className="cd-cards">
                        {filtered.map(req => {
                            const locInfo = getLocationInfo(req.location);
                            const statusClass = (req.status || '').replace(/\s+/g, '-');
                            const workerInitial = req.assignedWorker?.username?.charAt(0)?.toUpperCase() || '?';

                            return (
                                <div key={req._id} className={`cd-card cd-card--${statusClass}`}>
                                    <div className="cd-card-inner">

                                        {/* Map (left on desktop, top on mobile) */}
                                        {locInfo.coords && (
                                            <div className="cd-card-map">
                                                <MapContainer
                                                    center={locInfo.coords}
                                                    zoom={14}
                                                    style={{ height: '100%', width: '100%' }}
                                                    scrollWheelZoom={false}
                                                    dragging={false}
                                                    zoomControl={false}
                                                >
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    <Marker position={locInfo.coords}>
                                                        <Popup>{locInfo.address}</Popup>
                                                    </Marker>
                                                </MapContainer>
                                            </div>
                                        )}

                                        {/* Details (right) */}
                                        <div className="cd-card-details">
                                            {/* Service title + badge */}
                                            <div className="cd-card-top">
                                                <span className="cd-card-service">
                                                    <span className="cd-card-service-emoji">
                                                        {serviceEmojis[req.serviceType] || '🛠️'}
                                                    </span>
                                                    {serviceLabels[req.serviceType] || req.serviceType}
                                                </span>
                                                <span className={`cd-badge cd-badge--${statusClass}`}>
                                                    {(req.status || '').replace('-', ' ').toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Meta info */}
                                            <div className="cd-card-meta">
                                                <div className="cd-meta-item">📍 <span>{locInfo.address}</span></div>
                                                <div className="cd-meta-item">📅 <span>{new Date(req.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                                            </div>

                                            {req.description && (
                                                <div className="cd-card-desc">📝 {req.description}</div>
                                            )}

                                            {/* Assigned worker card */}
                                            {req.assignedWorker && (
                                                <div className="cd-worker-card">
                                                    <div className="cd-worker-avatar">{workerInitial}</div>
                                                    <div className="cd-worker-info">
                                                        <span className="cd-worker-name">{req.assignedWorker.username}</span>
                                                        {req.assignedWorker.phone && (
                                                            <span className="cd-worker-phone">📞 {req.assignedWorker.phone}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timing pills */}
                                            {(req.checkInTime || req.checkOutTime) && (
                                                <div className="cd-times">
                                                    {req.checkInTime && (
                                                        <span className="cd-time-in">✓ In: {new Date(req.checkInTime).toLocaleTimeString('en-IN')}</span>
                                                    )}
                                                    {req.checkOutTime && (
                                                        <span className="cd-time-out">⏎ Out: {new Date(req.checkOutTime).toLocaleTimeString('en-IN')}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {(req.status === 'completed' || req.status === 'pending') && (
                                                <div className="cd-card-actions">
                                                    {req.status === 'completed' && (
                                                        <>
                                                            <Link to="/create-request" className="cd-action cd-action--rebook">🔁 Rebook</Link>
                                                            {reviewedIds.has(req._id) ? (
                                                                <span style={{ color: "#10b981", fontSize: 13, fontWeight: 600, marginLeft: 12 }}>
                                                                    ✓ Reviewed
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setReviewModal(req)}
                                                                    style={{
                                                                        background: "#f97316", color: "#fff",
                                                                        border: "none", borderRadius: 8,
                                                                        padding: "8px 16px", fontWeight: 700,
                                                                        fontSize: 13, cursor: "pointer",
                                                                        marginLeft: 12, transition: "background 0.2s"
                                                                    }}
                                                                    onMouseOver={e => e.currentTarget.style.background = "#ea580c"}
                                                                    onMouseOut={e => e.currentTarget.style.background = "#f97316"}
                                                                >
                                                                    ⭐ Write Review
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    {req.status === 'pending' && (
                                                        <button className="cd-action cd-action--cancel"
                                                            onClick={() => { /* placeholder */ }}>
                                                            ❌ Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── REVIEW MODAL ───────────────────────────── */}
            {reviewModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "1rem"
                }}>
                    <div style={{
                        background: "#fff", width: "100%", maxWidth: "440px",
                        borderRadius: "20px", padding: "2rem",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a2533", margin: "0 0 0.5rem 0" }}>Rate Your Experience</h2>
                        <p style={{ color: "#64748b", margin: "0 0 1.5rem 0", fontSize: "0.95rem" }}>
                            {serviceLabels[reviewModal.serviceType] || reviewModal.serviceType} — <strong>{reviewModal.assignedWorker?.username}</strong>
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{
                                        fontSize: 40, cursor: "pointer",
                                        color: star <= rating ? "#f97316" : "#e2e8f0",
                                        transition: "color 0.15s, transform 0.1s",
                                        userSelect: "none"
                                    }}
                                    onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                                    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                                >★</span>
                            ))}
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Share your experience with this worker (optional)..."
                                rows={4}
                                style={{
                                    width: "100%", padding: "1rem", borderRadius: "12px",
                                    border: "1px solid #e2e8f0", fontSize: "0.95rem",
                                    fontFamily: "inherit", resize: "none", boxSizing: "border-box",
                                    backgroundColor: "#f8fafc"
                                }}
                                onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.outline = "none"; e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        {reviewError && (
                            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>
                                {reviewError}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={() => setReviewModal(null)}
                                style={{
                                    flex: 1, padding: "0.875rem", background: "#f1f5f9",
                                    color: "#475569", border: "none", borderRadius: "10px",
                                    fontWeight: 600, fontSize: "1rem", cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReview}
                                disabled={submitting}
                                style={{
                                    flex: 1, padding: "0.875rem", background: "#f97316",
                                    color: "#fff", border: "none", borderRadius: "10px",
                                    fontWeight: 600, fontSize: "1rem", cursor: submitting ? "not-allowed" : "pointer",
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
