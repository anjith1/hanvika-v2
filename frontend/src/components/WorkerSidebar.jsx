// frontend/src/components/WorkerSidebar.jsx
import React, { useState } from 'react';
import './WorkerSidebar.css';

const NAV = [
    {
        section: null,
        items: [
            { key: 'home', icon: '🏠', label: 'Dashboard', color: '#f0fdf4', ic: '#16a34a' },
        ],
    },
    {
        section: 'SITE OPERATIONS',
        items: [
            { key: 'todayInstr', icon: '🗓️', label: "Today's Instructions", color: '#e3f2fd', ic: '#1565c0' },
            { key: 'postInstr', icon: '📋', label: 'Post Instruction', color: '#fce4ec', ic: '#c62828' },
            { key: 'jobInstr', icon: '🔧', label: 'Job Instruction', color: '#fff3e0', ic: '#e65100' },
            { key: 'taskEvidence', icon: '📸', label: 'Tasking & Evidencing', color: '#fff8e1', ic: '#f57f17' },
            { key: 'patrol', icon: '🚶', label: 'Patrol', color: '#ede7f6', ic: '#4527a0' },
        ],
    },
    {
        section: 'MY PERSONAL DESK',
        items: [
            { key: 'attendance', icon: '📅', label: 'Attendance', color: '#e3f2fd', ic: '#1565c0' },
            { key: 'leave', icon: '🏖️', label: 'Leave', color: '#fff3e0', ic: '#e65100' },
            { key: 'regularize', icon: '🔄', label: 'Regularization', color: '#fce4ec', ic: '#c62828' },
            { key: 'missed', icon: '⚠️', label: 'Missed Attendance', color: '#efebe9', ic: '#4e342e' },
        ],
    },
    {
        section: 'ESCALATIONS & SUPPORT',
        items: [
            { key: 'escalations', icon: '📊', label: 'Escalations', color: '#e8f5e9', ic: '#2e7d32' },
            { key: 'reportIssue', icon: '🐛', label: 'Report Issue', color: '#ede7f6', ic: '#4527a0' },
            { key: 'incident', icon: '🚨', label: 'Incident', color: '#fff8e1', ic: '#f57f17' },
        ],
    },
];

export default function WorkerSidebar({ activeKey, onNav, user, onLogout, isOpen, onClose }) {
    const [collapsed, setCollapsed] = useState({});

    const toggleSection = (s) =>
        setCollapsed(p => ({ ...p, [s]: !p[s] }));

    const rawName = user?.name || user?.fullName || user?.username || 'Worker';
    const initials = rawName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="wds-overlay" onClick={onClose} />}

            <aside className={`wds ${isOpen ? 'wds--open' : ''}`}>
                {/* Brand */}
                <div className="wds-brand">
                    <div className="wds-brand-logo">
                        <span>H</span>
                    </div>
                    <div className="wds-brand-text">
                        <span className="wds-brand-name">HanVika</span>
                        <span className="wds-brand-sub">Worker Portal</span>
                    </div>
                    <button className="wds-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Worker profile card */}
                <div className="wds-profile">
                    <div className="wds-profile-avatar">{initials}</div>
                    <div className="wds-profile-info">
                        <span className="wds-profile-name">{rawName}</span>
                        <span className="wds-profile-role">Field Worker</span>
                    </div>
                    <div className="wds-profile-dot" title="Online" />
                </div>

                {/* Navigation */}
                <nav className="wds-nav">
                    {NAV.map((group, gi) => (
                        <div key={gi} className="wds-group">
                            {group.section && (
                                <button
                                    className="wds-section-hdr"
                                    onClick={() => toggleSection(group.section)}
                                >
                                    <span>{group.section}</span>
                                    <span className={`wds-chevron ${collapsed[group.section] ? 'wds-chevron--up' : ''}`}>›</span>
                                </button>
                            )}
                            {!collapsed[group.section] &&
                                group.items.map(item => (
                                    <button
                                        key={item.key}
                                        className={`wds-item ${activeKey === item.key ? 'wds-item--active' : ''}`}
                                        style={{ '--item-bg': item.color, '--item-ic': item.ic }}
                                        onClick={() => { onNav(item.key); onClose?.(); }}
                                    >
                                        <span className="wds-item-icon">{item.icon}</span>
                                        <span className="wds-item-label">{item.label}</span>
                                        {activeKey === item.key && <span className="wds-item-pip" />}
                                    </button>
                                ))}
                        </div>
                    ))}
                </nav>

                {/* Logoff */}
                <div className="wds-footer">
                    <button className="wds-logoff" onClick={onLogout}>
                        <span className="wds-logoff-icon">🔴</span>
                        <span>Log Off</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
