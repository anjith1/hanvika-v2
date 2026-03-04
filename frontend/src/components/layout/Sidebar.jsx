import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './Sidebar.css';

const NAV = [
    { to: '/customer/dashboard', icon: '◈', label: 'Dashboard' },
    { to: '/', icon: '⬡', label: 'Services', end: true },
    { to: '/create-request', icon: '✦', label: 'New Request' },
    { to: '/reviews', icon: '◎', label: 'Feedback' },
    { to: '/contact', icon: '◉', label: 'Contact' },
];

export default function Sidebar() {
    const { isAuthenticated, currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => { logout(); navigate('/'); };

    const initial = currentUser?.username?.[0]?.toUpperCase() || 'G';
    const name = currentUser?.username || 'Guest User';
    const role = currentUser?.role || 'Visitor';

    return (
        <aside className={`sb ${collapsed ? 'sb--collapsed' : ''}`}>
            {/* Top */}
            <div className="sb-top">
                <div className="sb-brand">
                    <div className="sb-mark">H</div>
                    {!collapsed && <span className="sb-title">Hanvika</span>}
                </div>
                <button className="sb-toggle" onClick={() => setCollapsed(p => !p)}>
                    {collapsed ? '›' : '‹'}
                </button>
            </div>

            {/* Profile */}
            {!collapsed && (
                <div className="sb-profile">
                    <div className="sb-avatar">{initial}</div>
                    <div className="sb-pinfo">
                        <span className="sb-pname">{name}</span>
                        <span className="sb-prole">{role}</span>
                    </div>
                    <div className="sb-status" />
                </div>
            )}

            {/* Nav */}
            <nav className="sb-nav">
                {NAV.map(({ to, icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `sb-link${isActive ? ' sb-link--active' : ''}`}
                    >
                        <span className="sb-icon">{icon}</span>
                        {!collapsed && <span className="sb-label">{label}</span>}
                        {!collapsed && <span className="sb-pill" />}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom */}
            <div className="sb-bottom">
                {isAuthenticated ? (
                    <button className="sb-link sb-logout" onClick={handleLogout}>
                        <span className="sb-icon">⏻</span>
                        {!collapsed && <span className="sb-label">Logout</span>}
                    </button>
                ) : (
                    <NavLink to="/select" className="sb-link">
                        <span className="sb-icon">→</span>
                        {!collapsed && <span className="sb-label">Sign In</span>}
                    </NavLink>
                )}
            </div>
        </aside>
    );
}
