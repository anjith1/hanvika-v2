// src/App.jsx — home is fully isolated, no sidebar/navbar
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

// Pages that render completely standalone — own layout, no sidebar, no outer navbar
const STANDALONE = [
  "/", "/select", "/login", "/worker-login", "/worker-form",
  "/workers-dashboard", "/admin-login", "/admin", "/unauthorized",
];

function AppRoutes() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin") || pathname === "/admin-login" || pathname === "/unauthorized";
  const isStandalone = STANDALONE.some(p => pathname === p) || isAdmin;

  if (isStandalone) {
    return (
      <Routes>
        <Route path="/" element={<WorkerSection />} />
        <Route path="/select" element={<Select />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/worker-login" element={<WorkerLogin />} />
        <Route path="/worker-form" element={<WorkerForm />} />
        <Route path="/workers-dashboard" element={<ProtectedRoute><WorkersDashboard /></ProtectedRoute>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/unauthorized" element={
          <div style={{ minHeight: "100vh", background: "#080e17", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "DM Sans,sans-serif" }}>
            <span style={{ fontSize: 56 }}>🚫</span>
            <h2 style={{ color: "#fff", margin: 0 }}>Access Denied</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>You don't have permission to view this page.</p>
            <a href="/select" style={{ color: "#f97316" }}>← Back to Role Selection</a>
          </div>
        } />
      </Routes>
    );
  }

  // App shell — sidebar + navbar + footer
  return (
    <AppLayout>
      <Navbar />
      <Routes>
        <Route path="/workers" element={<Navigate to="/" />} />
        <Route path="/workers/:categoryId" element={<ProtectedRoute><WorkerDetailsPage /></ProtectedRoute>} />
        <Route path="/customer/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
        <Route path="/reviews" element={<WorkerReviews />} />
        <Route path="/add-review" element={<ProtectedRoute><ReviewForm /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/orders" element={<Navigate to="/customer/dashboard" />} />
        <Route path="/saved" element={<Navigate to="/" />} />
        <Route path="/settings" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      <Chatbox />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}
