import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Protects /admin routes.
 * Allows access if the stored user has role === "ADMIN"
 * or if the demo admin flag is set (adminLoggedIn === "true").
 */
const AdminProtectedRoute = ({ children }) => {
    const location = useLocation();

    // Support both the real-auth path (currentUser.role) and
    // the demo admin flag used by the admin login page.
    const adminFlag = localStorage.getItem("adminLoggedIn") === "true";

    let roleIsAdmin = false;
    try {
        const stored = localStorage.getItem("currentUser");
        if (stored) {
            const user = JSON.parse(stored);
            roleIsAdmin = user?.role === "ADMIN";
        }
    } catch {
        // ignore parse errors
    }

    if (!adminFlag && !roleIsAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminProtectedRoute;
