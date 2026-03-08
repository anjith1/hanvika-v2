import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // For example, load from localStorage if you want "remember me"
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("currentUser");
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    // store in localStorage if you want
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    // Also clear worker-specific keys so no stale token survives
    localStorage.removeItem("workerToken");
    localStorage.removeItem("workerUser");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, authToken, currentUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
