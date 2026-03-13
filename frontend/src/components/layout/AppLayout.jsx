import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
    const location = useLocation();
    const showSidebar =
        location.pathname === "/customer/dashboard" ||
        location.pathname === "/create-request" ||
        location.pathname === "/reviews" ||
        location.pathname === "/contact" ||
        location.pathname.startsWith("/workers/");

    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleToggle = () => setSidebarOpen(prev => !prev);
        const handleOpen = () => setSidebarOpen(true);
        const handleClose = () => setSidebarOpen(false);

        window.addEventListener('toggleSidebar', handleToggle);
        window.addEventListener('openSidebar', handleOpen);
        window.addEventListener('closeSidebar', handleClose);

        return () => {
            window.removeEventListener('toggleSidebar', handleToggle);
            window.removeEventListener('openSidebar', handleOpen);
            window.removeEventListener('closeSidebar', handleClose);
        };
    }, []);

    useEffect(() => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="dashboard-layout">
            {showSidebar && <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
            <div className={`dashboard-main ${showSidebar ? (sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed') : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default AppLayout;
