import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    /* ── resolve customer name ────────────────────────────────── */
    const resolveUser = () => {
        // 1. AuthContext
        if (currentUser?.name || currentUser?.fullName || currentUser?.username) return currentUser;
        // 2. localStorage fallbacks
        try {
            const stored =
                localStorage.getItem('user') ||
                localStorage.getItem('currentUser') ||
                localStorage.getItem('customerUser');
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return null;
    };

    const user = resolveUser();
    const displayName = user?.name || user?.fullName || user?.username || 'Customer';
    const initial = displayName.charAt(0).toUpperCase();

    const handleLogout = () => {
        if (logout) logout();
        navigate('/');
    };

    return (
        <div className="sidebar">

            {/* ── brand ─────────────────────────────────────── */}
            <div className="sb-brand">
                <div className="sb-logo"><span>H</span></div>
                <div className="sb-brand-text">
                    <span className="sb-brand-name">HanVika</span>
                    <span className="sb-brand-sub">Customer Portal</span>
                </div>
            </div>

            {/* ── profile card ──────────────────────────────── */}
            <div className="sb-profile">
                <div className="sb-avatar-wrap">
                    <div className="sb-avatar">{initial}</div>
                    <span className="sb-dot" />
                </div>
                <div className="sb-profile-info">
                    <span className="sb-profile-name">{displayName}</span>
                    <span className="sb-profile-role">Customer</span>
                </div>
            </div>

            {/* ── nav ─────────────────────────────────────────── */}
            <span className="sb-section-label">MAIN MENU</span>

            <nav className="sb-nav">
                <NavLink to="/customer/dashboard" className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
                    <span className="sb-icon">🏠</span> Dashboard Home
                </NavLink>
                <div
                    className="sb-link"
                    onClick={() => navigate('/#services')}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="sb-icon">🔧</span> Service Categories
                </div>
                <NavLink to="/reviews" className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
                    <span className="sb-icon">⭐</span> Client Feedback
                </NavLink>
            </nav>

            {/* ── logout ──────────────────────────────────────── */}
            <div className="sb-footer">
                <button className="sb-logout" onClick={handleLogout}>
                    LOG OUT
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
