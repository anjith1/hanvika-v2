// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import WorkerSection from "./components/WorkerSection";
import WorkerDetailsPage from "./components/WorkerDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Footer from "./components/Footer";
import Select from "./components/Select";
import WorkerLogin from "./components/WorkerLogin";
import WorkersDashboard from "./components/WorkersDashboard";
import Contact from "./components/Contact";
import { AuthProvider } from "./AuthContext";
import WorkerForm from "./components/WorkerForm";
import ReviewForm from "./components/ReviewForm";
import WorkerReviews from "./components/WorkerReviews";
import AdminDashboard from "./components/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./components/AdminLogin";
import CustomerDashboard from "./components/CustomerDashboard";
import CreateRequest from "./components/CreateRequest";

function App() {
  const location = useLocation();

  // Standalone routes — NO Navbar, NO generic Sidebar, NO Footer
  const isStandalone =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/admin-login" ||
    location.pathname === "/unauthorized" ||
    location.pathname === "/workers-dashboard" ||
    location.pathname === "/worker-login" ||
    location.pathname === "/worker-form" ||
    location.pathname === "/select" ||
    location.pathname === "/login" ||
    location.pathname === "/";

  console.log('[App] path:', location.pathname, '| isStandalone:', isStandalone);

  // Hide Navbar on pages where the sidebar handles navigation
  const showNavbar =
    location.pathname !== '/customer/dashboard' &&
    location.pathname !== '/create-request' &&
    location.pathname !== '/reviews' &&
    location.pathname !== '/contact' &&
    !location.pathname.startsWith('/workers/');

  return (
    <AuthProvider>
      <div className="App">
        {isStandalone ? (
          <Routes>
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/workers-dashboard"
              element={
                <ProtectedRoute>
                  <WorkersDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/worker-login" element={<WorkerLogin />} />
            <Route path="/select" element={<Select />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<WorkerSection />} />
            <Route path="/worker-form" element={<WorkerForm />} />
            <Route
              path="/unauthorized"
              element={
                <div style={{
                  minHeight: "100vh",
                  background: "#0a0a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 16,
                  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                }}>
                  <span style={{ fontSize: 64 }}>🚫</span>
                  <h2 style={{ color: "#fff", margin: 0 }}>Access Denied</h2>
                  <p style={{ color: "rgba(255,255,255,0.5)" }}>You don't have permission to view this page.</p>
                  <a href="/select" style={{ color: "#60a5fa" }}>← Back to Role Selection</a>
                </div>
              }
            />
          </Routes>
        ) : (
          <AppLayout>
            {showNavbar && <Navbar />}
            <Routes>
              <Route path="/workers" element={<Navigate to="/" />} />
              <Route path="/worker-login" element={<WorkerLogin />} />
              <Route
                path="/workers/:categoryId"
                element={<ProtectedRoute><WorkerDetailsPage /></ProtectedRoute>}
              />
              <Route
                path="/customer/dashboard"
                element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>}
              />
              <Route
                path="/create-request"
                element={<ProtectedRoute><CreateRequest /></ProtectedRoute>}
              />
              <Route path="/reviews" element={<WorkerReviews />} />
              <Route
                path="/add-review"
                element={<ProtectedRoute><ReviewForm /></ProtectedRoute>}
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="/orders" element={<Navigate to="/customer/dashboard" />} />
              <Route path="/saved" element={<Navigate to="/" />} />
              <Route path="/settings" element={<Navigate to="/" />} />
            </Routes>
            <Footer />

          </AppLayout>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
