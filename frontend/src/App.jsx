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
import Chatbox from "./components/Chatbox";
import ReviewForm from "./components/ReviewForm";
import WorkerReviews from "./components/WorkerReviews";
import AdminDashboard from "./components/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./components/AdminLogin";
import CustomerDashboard from "./components/CustomerDashboard";
import CreateRequest from "./components/CreateRequest";

// ── Pages that render FULL-SCREEN with NO sidebar / no outer Navbar / no Footer
// Because they either have their own nav OR are completely standalone
const STANDALONE_PATHS = [
  "/",                  // WorkerSection — has its own navbar+footer
  "/select",            // Select — has its own navbar built-in
  "/worker-login",      // WorkerLogin — standalone auth page
  "/worker-form",       // WorkerForm  — standalone form
  "/login",             // LoginPage   — standalone auth page
  "/workers-dashboard", // WorkersDashboard — has its own sidebar
  "/admin-login",       // Admin auth
  "/admin",             // Admin dashboard
  "/unauthorized",      // Error page
];

function AppRoutes() {
  const location = useLocation();

  const isStandalone = STANDALONE_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith("/admin")
  );

  return isStandalone ? (
    /* ── STANDALONE: zero outer chrome ──────────────────────────────────── */
    <Routes>
      {/* Home */}
      <Route path="/" element={<WorkerSection />} />

      {/* Role selector — has its own navbar built-in */}
      <Route path="/select" element={<Select />} />

      {/* Worker auth — standalone */}
      <Route path="/worker-login" element={<WorkerLogin />} />
      <Route path="/worker-form" element={<WorkerForm />} />

      {/* Customer auth — standalone */}
      <Route path="/login" element={<LoginPage />} />

      {/* Worker dashboard — has its own sidebar */}
      <Route
        path="/workers-dashboard"
        element={
          <ProtectedRoute>
            <WorkersDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
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
        path="/unauthorized"
        element={
          <div style={{
            minHeight: "100vh", background: "#0a0a1a",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 16,
            fontFamily: "'DM Sans','Segoe UI',sans-serif",
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
    /* ── APP SHELL: sidebar + navbar + footer ────────────────────────────── */
    <AppLayout>
      <Navbar />
      <Routes>
        <Route path="/workers" element={<Navigate to="/" />} />
        <Route
          path="/workers/:categoryId"
          element={
            <ProtectedRoute>
              <WorkerDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-request"
          element={
            <ProtectedRoute>
              <CreateRequest />
            </ProtectedRoute>
          }
        />
        <Route path="/reviews" element={<WorkerReviews />} />
        <Route
          path="/add-review"
          element={
            <ProtectedRoute>
              <ReviewForm />
            </ProtectedRoute>
          }
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
      <Chatbox />
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
