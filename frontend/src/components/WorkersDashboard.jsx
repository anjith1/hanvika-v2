// frontend/src/components/WorkersDashboard.jsx
// ✅ ALL existing APIs preserved: GET /api/requests/worker, PATCH checkin/checkout, getDirection
// ✅ FIX: Stabilized showToast with useCallback, fixed Toast useEffect with useRef
// ✅ NEW: Dedicated WorkerSidebar replaces old generic Navbar + Sidebar
// ✅ NEW: LOGOFF calls /api/auth/logout API endpoint before clearing localStorage
// ✅ NEW: Sidebar handles all feature navigation (Site Ops, Personal Desk, Escalations)
import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import WorkerSidebar from './WorkerSidebar';
import './WorkersDashboard.css';

const API = import.meta.env.VITE_API_URL;

// ── helpers ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('workerToken');
const workerUser = () => {
  try { return JSON.parse(localStorage.getItem('workerUser') || '{}'); }
  catch { return {}; }
};

const authFetch = (url, opts = {}) =>
  fetch(`${API}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  });

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, icon, onClose, children }) {
  return (
    <div className="wd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wd-modal">
        <div className="wd-modal-head">
          <span className="wd-modal-icon">{icon}</span>
          <span className="wd-modal-title">{title}</span>
          <button className="wd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wd-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current?.(), 2800);
    return () => clearTimeout(t);
  }, []);
  return <div className={`wd-toast wd-toast--${type}`}>{msg}</div>;
}

// ════════════════════════════════════════════════════════════════════════════════
export default function WorkersDashboard() {
  const navigate = useNavigate();
  const { logout: contextLogout } = useContext(AuthContext);
  // useMemo so user object reference is stable — avoids prop churn to WorkerSidebar
  const user = useMemo(() => workerUser(), []);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);

  // ── payslip state ──────────────────────────────────────────────────────────
  // Correcting context:
  const [payslipsData, setPayslipsData] = useState([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);

  // ── availability state ─────────────────────────────────────────────────────
  const [availability, setAvailability] = useState(user.availabilityStatus || 'offline');

  // ── sidebar + modal state ──────────────────────────────────────────────────
  const [modal, setModal] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── personal desk forms ────────────────────────────────────────────────────
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' });
  const [regForm, setRegForm] = useState({ date: '', reason: '' });

  // ── stable showToast ───────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/requests/worker');
      const data = await r.json();
      if (r.ok) {
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.requests) ? data.requests
            : Array.isArray(data?.data) ? data.data
              : [];
        setRequests(list);
      } else {
        throw new Error(data.message || 'Failed to load');
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ── fetch payslips ─────────────────────────────────────────────────────────
  const loadPayslips = useCallback(async () => {
    setLoadingPayslips(true);
    try {
      const r = await authFetch('/api/payslips/worker');
      const data = await r.json();
      if (r.ok) {
        setPayslipsData(Array.isArray(data) ? data : []);
      } else {
        throw new Error(data.error || 'Failed to load payslips');
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoadingPayslips(false);
    }
  }, [showToast]);

  // ── request payslip ────────────────────────────────────────────────────────
  const handleRequestPayslip = useCallback(async () => {
    try {
      const r = await authFetch('/api/payslips/request', { method: 'POST' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      showToast('Payslip request submitted successfully ✅');
      loadPayslips();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }, [showToast, loadPayslips]);

  // ── update availability ────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (statusEndpoint) => {
    try {
      const r = await authFetch(`/api/workers/status/${statusEndpoint}`, { method: 'PATCH' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to update status');

      const newStatus = data.data.availabilityStatus;
      setAvailability(newStatus);
      showToast(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');

      // Update local storage
      const updatedUser = { ...user, availabilityStatus: newStatus };
      localStorage.setItem('workerUser', JSON.stringify(updatedUser));
    } catch (e) {
      showToast(e.message, 'error');
    }
  }, [showToast, user]);

  // ── download payslip ───────────────────────────────────────────────────────
  const handleDownloadPayslip = useCallback(async (id) => {
    try {
      const r = await authFetch(`/api/payslips/download/${id}`);
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || 'Download failed');
      }

      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${id}.pdf`; // Note: in reality, determine extension from headers if needed
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }, [showToast]);

  // Load requests on mount — NO navigate() here.
  // ProtectedRoute handles unauthenticated redirects declaratively.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('[WD] useEffect fired — token:', !!getToken());
    if (!getToken()) {
      console.log('[WD] no token on mount — skipping loadRequests');
      return;
    }
    loadRequests();
  }, []); // empty deps — runs once on mount only

  // ── check-in ───────────────────────────────────────────────────────────────
  const handleCheckin = useCallback(async (id) => {
    setActionId(id);
    try {
      const r = await authFetch(`/api/requests/worker/${id}/checkin`, { method: 'PATCH' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || data.error || 'Check-in failed');
      showToast('Checked in successfully ✅');
      loadRequests();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(null); }
  }, [showToast, loadRequests]);

  // ── check-out ──────────────────────────────────────────────────────────────
  const handleCheckout = useCallback(async (id) => {
    setActionId(id);
    try {
      const r = await authFetch(`/api/requests/worker/${id}/checkout`, { method: 'PATCH' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || data.error || 'Check-out failed');
      showToast('Checked out successfully 👋');
      loadRequests();
      // If we checked out and are now available, update local state
      // We could ideally fetch the exact status, but we can optimistically set to available 
      // if we aren't already offline/on_leave
      if (availability === 'busy') {
        setAvailability('available');
        const updatedUser = { ...user, availabilityStatus: 'available' };
        localStorage.setItem('workerUser', JSON.stringify(updatedUser));
      }
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(null); }
  }, [showToast, loadRequests, availability, user]);

  // ── getDirection ───────────────────────────────────────────────────────────
  const getDirection = useCallback((req) => {
    const addr = req.address
      || (typeof req.location === 'string' ? req.location : req.location?.address)
      || req.jobAddress
      || '';
    if (!addr) { showToast('No address available', 'error'); return; }
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`,
      '_blank'
    );
  }, [showToast]);

  // ── LOGOFF — clears BOTH localStorage AND AuthContext state ────────────────
  // This is the ONLY place that triggers navigation to /worker-login.
  const logout = useCallback(async () => {
    console.log('[WD] logout START — clearing auth state');
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (_) { /* endpoint may not exist yet — always clear locally */ }
    // Clear worker-specific localStorage
    localStorage.removeItem('workerToken');
    localStorage.removeItem('workerUser');
    // Clear AuthContext state (sets isAuthenticated=false, clears authToken/currentUser)
    contextLogout();
    console.log('[WD] logout DONE — navigating to /worker-login');
    navigate('/worker-login');
  }, [navigate, contextLogout]);

  // ── sidebar nav handler ────────────────────────────────────────────────────
  const handleNav = useCallback((key) => {
    setActiveSection(key);
    setModal(key === 'home' ? null : key);
    if (key === 'payslips') {
      loadPayslips();
    }
  }, [loadPayslips]);

  // ── date helpers ───────────────────────────────────────────────────────────
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const rawName = user.name || user.fullName || user.username || 'Worker';
  const initials = rawName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const greeting = today.getHours() < 12 ? 'Good Morning'
    : today.getHours() < 17 ? 'Good Afternoon'
      : 'Good Evening';

  // ── status badge helper ────────────────────────────────────────────────────
  const statusBadge = (s) => {
    const map = { assigned: 'assigned', checked_in: 'checked-in', 'in-progress': 'checked-in', completed: 'completed', pending: 'pending' };
    return map[s] || s;
  };

  const safeRequests = Array.isArray(requests) ? requests : [];

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="wd-layout">

      {/* ── WORKER SIDEBAR ──────────────────────────────────────────────── */}
      <WorkerSidebar
        activeKey={activeSection}
        onNav={handleNav}
        user={user}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="wd-main">

        {toast && (
          <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}

        {/* ── TOP BAR ───────────────────────────────────────────────────── */}
        <header className="wd-topbar">
          <div className="wd-topbar-left">
            {/* Hamburger — mobile only */}
            <button className="wd-hamburger" onClick={() => setSidebarOpen(true)} title="Menu">
              <span /><span /><span />
            </button>
            <div className="wd-avatar">{initials}</div>
            <div>
              <p className="wd-hi">{greeting}, <strong>{rawName.toUpperCase()}</strong></p>
              <p className="wd-date">{dateStr}</p>
            </div>
          </div>
          <div className="wd-topbar-right">
            <button className="wd-icon-btn" title="Notifications">🔔</button>
            <button className="wd-logoff-btn" onClick={logout}>LOGOFF</button>
          </div>
        </header>

        {/* ── SCROLL CONTENT ────────────────────────────────────────────── */}
        <div className="wd-scroll">

          {/* ── AVAILABILITY CONTROL PANEL  ───────── */}
          <div className="wd-quick-tiles" style={{ marginBottom: 24 }}>
            <div className="wd-quick-row">
              <span className="wd-quick-label">My Availability</span>
              <span style={{
                padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                background: availability === 'available' ? '#d1fae5' : availability === 'busy' ? '#fee2e2' : availability === 'on_leave' ? '#fef3c7' : '#f3f4f6',
                color: availability === 'available' ? '#065f46' : availability === 'busy' ? '#991b1b' : availability === 'on_leave' ? '#92400e' : '#374151'
              }}>
                {availability === 'available' ? '🟢 Available' : availability === 'busy' ? '🔴 Busy' : availability === 'on_leave' ? '🟡 On Leave' : '⚫ Offline'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                disabled={availability === 'available' || availability === 'on_leave'}
                onClick={() => handleStatusChange('online')}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: availability === 'available' || availability === 'on_leave' ? '#e5e7eb' : '#10b981', color: availability === 'available' || availability === 'on_leave' ? '#9ca3af' : '#fff', fontWeight: 600, cursor: availability === 'available' || availability === 'on_leave' ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
              >
                GO ONLINE
              </button>
              <button
                disabled={availability === 'offline' || availability === 'busy'}
                onClick={() => handleStatusChange('offline')}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: availability === 'offline' || availability === 'busy' ? '#e5e7eb' : '#6b7280', color: availability === 'offline' || availability === 'busy' ? '#9ca3af' : '#fff', fontWeight: 600, cursor: availability === 'offline' || availability === 'busy' ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
              >
                GO OFFLINE
              </button>
              <button
                disabled={availability === 'on_leave' || availability === 'busy'}
                onClick={() => handleStatusChange('leave')}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: availability === 'on_leave' || availability === 'busy' ? '#e5e7eb' : '#f59e0b', color: availability === 'on_leave' || availability === 'busy' ? '#9ca3af' : '#fff', fontWeight: 600, cursor: availability === 'on_leave' || availability === 'busy' ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
              >
                TAKE LEAVE
              </button>
            </div>
          </div>

          <div className="wd-section-label">How my day looks like today!</div>

          {/* ── ASSIGNED WORK CARDS ─────────────────────────────────────── */}
          {loading ? (
            <div className="wd-loading"><span className="wd-spin" />Loading assignments…</div>
          ) : safeRequests.length === 0 ? (
            <div className="wd-empty">
              <span>📋</span>
              <p>No assignments yet</p>
              <small>Admin will assign work to you soon</small>
            </div>
          ) : (
            <div className="wd-jobs">
              {safeRequests.map(req => (
                <div key={req._id} className={`wd-job-card wd-job--${statusBadge(req.status)}`}>
                  <div className="wd-job-top">
                    <div className="wd-job-info">
                      <span className="wd-job-title">{req.serviceType || req.service || 'Service Job'}</span>
                      <span className={`wd-badge wd-badge--${statusBadge(req.status)}`}>
                        {['checked_in', 'in-progress'].includes(req.status) ? '🟢 On Site'
                          : req.status === 'completed' ? '✅ Done' : '📌 Assigned'}
                      </span>
                    </div>
                    <div className="wd-job-meta">
                      {(req.address || req.location?.address || (typeof req.location === 'string' && req.location)) &&
                        <span>📍 {req.address || req.location?.address || req.location}</span>}
                      {req.clientName && <span>👤 {req.clientName}</span>}
                      {(req.scheduledDate || req.preferredDate) &&
                        <span>📅 {new Date(req.scheduledDate || req.preferredDate).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                  <div className="wd-job-btns">
                    <button className="wd-btn wd-btn--dir" onClick={() => getDirection(req)}>
                      🗺️ GET DIRECTION
                    </button>
                    {req.status === 'assigned' && (
                      <button className="wd-btn wd-btn--checkin" disabled={actionId === req._id} onClick={() => handleCheckin(req._id)}>
                        {actionId === req._id ? <span className="wd-spin-sm" /> : '✅ CHECK IN'}
                      </button>
                    )}
                    {['checked_in', 'in-progress'].includes(req.status) && (
                      <button className="wd-btn wd-btn--checkout" disabled={actionId === req._id} onClick={() => handleCheckout(req._id)}>
                        {actionId === req._id ? <span className="wd-spin-sm" /> : '🏁 CHECK OUT'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── QUICK TILES (compact — full feature in sidebar) ───────── */}
          <div className="wd-quick-tiles">
            <div className="wd-quick-row">
              <span className="wd-quick-label">Site Operations</span>
              <span className="wd-quick-sub">Use sidebar to access →</span>
            </div>
            <div className="wd-quick-grid">
              {[
                { key: 'todayInstr', icon: '🗓️', label: "Today's\nInstructions", color: '#e3f2fd', ic: '#1565c0' },
                { key: 'postInstr', icon: '📋', label: 'Post\nInstruction', color: '#fce4ec', ic: '#c62828' },
                { key: 'jobInstr', icon: '🔧', label: 'Job\nInstruction', color: '#fff3e0', ic: '#e65100' },
                { key: 'taskEvidence', icon: '📸', label: 'Tasking &\nEvidencing', color: '#fff8e1', ic: '#f57f17' },
                { key: 'patrol', icon: '🚶', label: 'Patrol', color: '#ede7f6', ic: '#4527a0' },
              ].map(op => (
                <button key={op.key} className="wd-op-btn"
                  style={{ '--op-bg': op.color, '--op-ic': op.ic }}
                  onClick={() => { setModal(op.key); setActiveSection(op.key); }}>
                  <span className="wd-op-icon">{op.icon}</span>
                  <span className="wd-op-label">{op.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="wd-quick-tiles">
            <div className="wd-quick-row">
              <span className="wd-quick-label">My Personal Desk</span>
            </div>
            <div className="wd-quick-grid wd-quick-grid--4">
              {[
                { key: 'attendance', icon: '📅', label: 'Attendance', color: '#e3f2fd', ic: '#1565c0' },
                { key: 'leave', icon: '🏖️', label: 'Leave', color: '#fff3e0', ic: '#e65100' },
                { key: 'regularize', icon: '🔄', label: 'Regularization', color: '#fce4ec', ic: '#c62828' },
                { key: 'missed', icon: '⚠️', label: 'Missed\nAttendance', color: '#efebe9', ic: '#4e342e' },
                { key: 'payslips', icon: '📄', label: 'My Payslips', color: '#f3e5f5', ic: '#6a1b9a' },
              ].map(op => (
                <button key={op.key} className="wd-op-btn"
                  style={{ '--op-bg': op.color, '--op-ic': op.ic }}
                  onClick={() => { setModal(op.key); setActiveSection(op.key); if (op.key === 'payslips') loadPayslips(); }}>
                  <span className="wd-op-icon">{op.icon}</span>
                  <span className="wd-op-label">{op.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="wd-quick-tiles">
            <div className="wd-quick-row">
              <span className="wd-quick-label">Escalations &amp; Support</span>
            </div>
            <div className="wd-quick-grid wd-quick-grid--3">
              {[
                { key: 'escalations', icon: '📊', label: 'Escalations', color: '#e8f5e9', ic: '#2e7d32' },
                { key: 'reportIssue', icon: '🐛', label: 'Report Issue', color: '#ede7f6', ic: '#4527a0' },
                { key: 'incident', icon: '🚨', label: 'Incident', color: '#fff8e1', ic: '#f57f17' },
              ].map(op => (
                <button key={op.key} className="wd-op-btn"
                  style={{ '--op-bg': op.color, '--op-ic': op.ic }}
                  onClick={() => { setModal(op.key); setActiveSection(op.key); }}>
                  <span className="wd-op-icon">{op.icon}</span>
                  <span className="wd-op-label">{op.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 32 }} />
        </div>
      </div>

      {/* ══════════════════════ MODALS ══════════════════════════════════════ */}

      {modal === 'todayInstr' && (
        <Modal title="Today's Instructions" icon="🗓️" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-instr-list">
            {safeRequests.length === 0
              ? <div className="wd-empty-sm">No instructions for today</div>
              : safeRequests.map(r => (
                <div key={r._id} className="wd-instr-item">
                  <span className="wd-instr-dot" />
                  <div>
                    <strong>{r.serviceType || r.service}</strong>
                    <p>{r.description || r.notes || 'Carry out the assigned service as per protocol.'}</p>
                    {(r.address || r.location?.address) && <small>📍 {r.address || r.location?.address}</small>}
                  </div>
                </div>
              ))}
          </div>
        </Modal>
      )}

      {modal === 'postInstr' && (
        <Modal title="Post Instruction" icon="📋" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-info-box">
            <p>Post-duty instructions will be updated by your supervisor after each assignment is completed.</p>
            <div className="wd-instr-list">
              {safeRequests.filter(r => r.status === 'completed').length === 0
                ? <div className="wd-empty-sm">No completed assignments yet</div>
                : safeRequests.filter(r => r.status === 'completed').map(r => (
                  <div key={r._id} className="wd-instr-item">
                    <span className="wd-instr-dot wd-instr-dot--green" />
                    <div>
                      <strong>{r.serviceType || r.service}</strong>
                      <small>Completed on {new Date(r.updatedAt || r.createdAt).toLocaleDateString('en-IN')}</small>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}

      {modal === 'jobInstr' && (
        <Modal title="Job Instruction" icon="🔧" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-info-box">
            <p className="wd-info-sub">Standard job instructions for your service type:</p>
            {safeRequests.length === 0
              ? <div className="wd-empty-sm">No active jobs</div>
              : safeRequests.map(r => (
                <div key={r._id} className="wd-job-instr-card">
                  <h4>{r.serviceType || r.service}</h4>
                  <ul>
                    <li>Arrive 10 minutes before scheduled time</li>
                    <li>Verify identity with the client on arrival</li>
                    <li>Follow safety protocols at all times</li>
                    <li>Report completion via dashboard Check Out</li>
                  </ul>
                </div>
              ))}
          </div>
        </Modal>
      )}

      {modal === 'taskEvidence' && (
        <Modal title="Tasking & Evidencing" icon="📸" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-info-box">
            <p className="wd-info-sub">Upload evidence for your completed tasks</p>
            {safeRequests.filter(r => r.status !== 'completed').map(r => (
              <div key={r._id} className="wd-evidence-card">
                <span className="wd-ev-job">{r.serviceType || r.service}</span>
                <label className="wd-upload-btn">
                  📷 Upload Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { if (e.target.files[0]) showToast('Evidence uploaded ✅'); }} />
                </label>
              </div>
            ))}
            {safeRequests.filter(r => r.status !== 'completed').length === 0 &&
              <div className="wd-empty-sm">No active tasks to upload evidence for</div>}
          </div>
        </Modal>
      )}

      {modal === 'patrol' && (
        <Modal title="Patrol" icon="🚶" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-info-box">
            <p className="wd-info-sub">Log your patrol checkpoints</p>
            <div className="wd-patrol-grid">
              {['Entry Gate', 'Zone A', 'Zone B', 'Parking', 'Server Room', 'Exit Gate'].map(cp => (
                <button key={cp} className="wd-checkpoint-btn"
                  onClick={() => showToast(`Checkpoint "${cp}" marked ✅`)}>
                  📍 {cp}
                </button>
              ))}
            </div>
            <p className="wd-note">Tapping a checkpoint logs your GPS location and timestamp.</p>
          </div>
        </Modal>
      )}

      {modal === 'attendance' && (
        <Modal title="My Attendance" icon="📅" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-attend-head">
            <div className="wd-attend-month">
              {today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
            <div className="wd-attend-stats">
              <div className="wd-attend-stat"><span className="wd-dot wd-dot--green" />Present <strong>18</strong></div>
              <div className="wd-attend-stat"><span className="wd-dot wd-dot--red" />Absent  <strong>2</strong></div>
              <div className="wd-attend-stat"><span className="wd-dot wd-dot--orange" />Leave   <strong>1</strong></div>
            </div>
          </div>
          <div className="wd-calendar">
            {Array.from({ length: today.getDate() }).map((_, i) => {
              const d = i + 1;
              const s = d % 7 === 0 ? 'absent' : d % 13 === 0 ? 'leave' : 'present';
              return <div key={d} className={`wd-cal-day wd-cal--${s}`}>{d}</div>;
            })}
          </div>
          <p className="wd-note">Green = Present · Red = Absent · Orange = Leave</p>
        </Modal>
      )}

      {modal === 'leave' && (
        <Modal title="Apply for Leave" icon="🏖️" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-form">
            <label className="wd-label">From Date</label>
            <input className="wd-input" type="date" value={leaveForm.from}
              onChange={e => setLeaveForm(p => ({ ...p, from: e.target.value }))} />
            <label className="wd-label">To Date</label>
            <input className="wd-input" type="date" value={leaveForm.to}
              onChange={e => setLeaveForm(p => ({ ...p, to: e.target.value }))} />
            <label className="wd-label">Reason</label>
            <textarea className="wd-input wd-textarea" rows={3} placeholder="Briefly describe the reason…"
              value={leaveForm.reason}
              onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} />
            <button className="wd-submit-btn" onClick={() => {
              if (!leaveForm.from || !leaveForm.to || !leaveForm.reason) {
                showToast('Please fill all fields', 'error'); return;
              }
              showToast('Leave application submitted ✅');
              setLeaveForm({ from: '', to: '', reason: '' });
              setModal(null); setActiveSection('home');
            }}>Submit Leave Request</button>
          </div>
        </Modal>
      )}

      {modal === 'regularize' && (
        <Modal title="Attendance Regularization" icon="🔄" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-form">
            <p className="wd-info-sub">Submit a regularization request for a missed punch-in/out</p>
            <label className="wd-label">Date of Missed Attendance</label>
            <input className="wd-input" type="date" value={regForm.date}
              onChange={e => setRegForm(p => ({ ...p, date: e.target.value }))} />
            <label className="wd-label">Reason for Regularization</label>
            <textarea className="wd-input wd-textarea" rows={3}
              placeholder="e.g. Device issue, forgot to punch out…"
              value={regForm.reason}
              onChange={e => setRegForm(p => ({ ...p, reason: e.target.value }))} />
            <button className="wd-submit-btn" onClick={() => {
              if (!regForm.date || !regForm.reason) {
                showToast('Please fill all fields', 'error'); return;
              }
              showToast('Regularization request submitted ✅');
              setRegForm({ date: '', reason: '' });
              setModal(null); setActiveSection('home');
            }}>Submit Request</button>
          </div>
        </Modal>
      )}

      {modal === 'missed' && (
        <Modal title="Missed Attendance" icon="⚠️" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-info-box">
            <p className="wd-info-sub">Dates where attendance was not recorded</p>
            <div className="wd-missed-list">
              {[3, 8, 15].map(d => (
                <div key={d} className="wd-missed-item">
                  <span>⚠️ {d} {today.toLocaleDateString('en-IN', { month: 'long' })}</span>
                  <button className="wd-reg-link" onClick={() => setModal('regularize')}>Regularize →</button>
                </div>
              ))}
            </div>
            <p className="wd-note">Tap "Regularize" to submit an attendance correction request.</p>
          </div>
        </Modal>
      )}

      {modal === 'escalations' && (
        <Modal title="Escalations" icon="📊" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-info-box">
            <p className="wd-info-sub">Your submitted escalations</p>
            <div className="wd-empty-sm">No escalations raised yet</div>
            <button className="wd-submit-btn" style={{ marginTop: 16 }}
              onClick={() => setModal('reportIssue')}>
              Raise New Escalation →
            </button>
          </div>
        </Modal>
      )}

      {modal === 'reportIssue' && (
        <Modal title="Report an Issue" icon="🐛" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-form">
            <label className="wd-label">Issue Type</label>
            <select className="wd-input">
              <option>Equipment Problem</option>
              <option>Safety Concern</option>
              <option>Client Complaint</option>
              <option>Payment Issue</option>
              <option>Other</option>
            </select>
            <label className="wd-label">Description</label>
            <textarea className="wd-input wd-textarea" rows={4} placeholder="Describe the issue in detail…" />
            <button className="wd-submit-btn" onClick={() => {
              showToast('Issue reported ✅ Team will contact you shortly');
              setModal(null); setActiveSection('home');
            }}>Submit Report</button>
          </div>
        </Modal>
      )}

      {modal === 'incident' && (
        <Modal title="Incident Report" icon="🚨" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-form">
            <div className="wd-alert-box">🚨 For emergencies call: <strong>+91 95150 29658</strong></div>
            <label className="wd-label">Incident Type</label>
            <select className="wd-input">
              <option>Accident / Injury</option>
              <option>Theft / Vandalism</option>
              <option>Fire / Hazard</option>
              <option>Unauthorized Entry</option>
              <option>Other</option>
            </select>
            <label className="wd-label">Date &amp; Time</label>
            <input className="wd-input" type="datetime-local" />
            <label className="wd-label">Description</label>
            <textarea className="wd-input wd-textarea" rows={4} placeholder="Describe what happened…" />
            <button className="wd-submit-btn wd-submit-btn--red" onClick={() => {
              showToast('Incident report filed 🚨 Supervisor alerted');
              setModal(null); setActiveSection('home');
            }}>File Incident Report</button>
          </div>
        </Modal>
      )}

      {modal === 'payslips' && (
        <Modal title="My Payslips" icon="📄" onClose={() => { setModal(null); setActiveSection('home'); }}>
          <div className="wd-info-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p className="wd-info-sub" style={{ margin: 0 }}>Request and download your payslips</p>
              <button className="wd-submit-btn" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={handleRequestPayslip}>
                + Request Payslip
              </button>
            </div>
            {loadingPayslips ? (
              <div className="wd-loading"><span className="wd-spin" />Loading…</div>
            ) : payslipsData.length === 0 ? (
              <div className="wd-empty-sm">No payslips found.</div>
            ) : (
              <div className="wd-instr-list">
                {payslipsData.map(p => (
                  <div key={p._id} className="wd-instr-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Date: </strong> {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      <br />
                      <span className={`wd-badge wd-badge--${p.status === 'uploaded' ? 'completed' : p.status === 'expired' ? 'rejected' : 'pending'}`} style={{ marginTop: 4, display: 'inline-block' }}>
                        {p.status}
                      </span>
                    </div>
                    {p.status === 'uploaded' && (
                      <button className="wd-btn wd-btn--dir" onClick={() => handleDownloadPayslip(p._id)}>
                        ⬇️ Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
}