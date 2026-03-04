import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ display: 'flex', width: '100%', background: '#0d1117', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                marginLeft: collapsed ? '64px' : '240px',
                width: collapsed ? 'calc(100% - 64px)' : 'calc(100% - 240px)',
                minHeight: '100vh',
                background: '#0d1117',
                transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {children}
            </main>
        </div>
    );
}
