import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    // Worker routes should redirect to worker-login, not the customer login
    const workerRedirect = location.pathname.startsWith('/workers');
    return <Navigate to={workerRedirect ? "/worker-login" : "/login"} state={{ from: location }} replace />;
  }

  // Block USER from direct worker routes
  if (currentUser?.role === 'USER' && location.pathname.startsWith('/workers/')) {
    return <Navigate to="/create-request" replace />;
  }

  return children;
};

export default ProtectedRoute;
