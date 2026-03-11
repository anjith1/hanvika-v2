import React from 'react';
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

    return (
        <div style={{ display: "flex", width: "100%" }}>
            {showSidebar && <Sidebar />}
            <div style={{
                marginLeft: showSidebar ? "250px" : "0",
                width: showSidebar ? "calc(100% - 250px)" : "100%",
                padding: "40px",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column"
            }}>
                {children}
            </div>
        </div>
    );
};

export default AppLayout;
