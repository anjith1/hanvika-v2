import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const { isAuthenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [signupData, setSignupData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/workers";

  const handleToggle = () => {
    setActiveTab((prev) => (prev === "login" ? "signup" : "login"));
    setError("");
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        username: signupData.username,
        phone: signupData.phone,
        email: signupData.email,
        password: signupData.password,
      });
      console.log("Signup response:", response.data);
      alert("Sign up successful! You can now log in.");
      setActiveTab("login");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Signup failed");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        identifier: loginData.identifier,
        password: loginData.password,
      });
      const { token, user } = response.data;
      login(token, user);

      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Invalid credentials. Please check your username/email and password.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Basic fallback if they land here already authenticated
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  /* ── shared inline styles ──────────────────────────────────── */
  const S = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1a2533 50%, #0d1117 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
    },
    orb1: {
      position: "absolute", width: 400, height: 400, borderRadius: "50%",
      background: "#f97316", opacity: 0.08, filter: "blur(120px)",
      top: -100, left: -80, pointerEvents: "none",
    },
    orb2: {
      position: "absolute", width: 300, height: 300, borderRadius: "50%",
      background: "#3b82f6", opacity: 0.06, filter: "blur(120px)",
      bottom: -60, right: -60, pointerEvents: "none",
    },
    card: {
      position: "relative", zIndex: 2,
      background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24, padding: "48px 44px", width: "100%", maxWidth: 440,
      boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
    },
    back: {
      background: "transparent", border: "none", color: "#64748b",
      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
      fontSize: 13, marginBottom: 24, padding: 0, fontFamily: "'DM Sans', sans-serif",
    },
    logoWrap: { textAlign: "center", marginBottom: 36 },
    logoIcon: {
      width: 48, height: 48, borderRadius: 16, margin: "0 auto",
      background: "linear-gradient(135deg, #f97316, #fb923c)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
    },
    title: {
      fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22,
      color: "#fff", letterSpacing: 1, marginTop: 16,
    },
    subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
    info: {
      background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
      borderRadius: 10, padding: "12px 16px", marginBottom: 24,
      display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "#f59e0b",
    },
    label: {
      display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 1, color: "#94a3b8", marginBottom: 8,
    },
    input: {
      width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 14,
      fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
      marginBottom: 20,
    },
    err: {
      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13,
      marginBottom: 16,
    },
    submit: {
      width: "100%", background: "linear-gradient(135deg, #f97316, #fb923c)",
      color: "#fff", border: "none", borderRadius: 12, padding: 15,
      fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif",
      letterSpacing: 0.5, cursor: "pointer",
      boxShadow: "0 8px 24px rgba(249,115,22,0.3)",
    },
    footer: { textAlign: "center", marginTop: 24, fontSize: 13, color: "#64748b" },
    link: { color: "#f97316", cursor: "pointer", fontWeight: 600, background: "none", border: "none", fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
    tabs: {
      display: "flex", background: "#0f172a", borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)", padding: 4,
      marginBottom: 28, gap: 4,
    },
    tab: (active) => ({
      flex: 1, padding: "10px 0", border: "none", borderRadius: 8,
      fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
      letterSpacing: 0.5, cursor: "pointer", transition: "all 0.2s",
      background: active ? "linear-gradient(135deg, #f97316, #fb923c)" : "transparent",
      color: active ? "#fff" : "#64748b",
    }),
  };

  return (
    <div style={S.page}>
      <div style={S.orb1} />
      <div style={S.orb2} />

      <div style={S.card}>
        <button style={S.back} onClick={() => navigate("/select")}>← Back to Role Selection</button>

        {/* Header */}
        <div style={S.logoWrap}>
          <div style={S.logoIcon}>🏠</div>
          <div style={S.title}>CUSTOMER LOGIN</div>
          <div style={S.subtitle}>HanVika Customer Portal</div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={S.tab(activeTab === "login")} onClick={() => { setActiveTab("login"); setError(""); }}>LOG IN</button>
          <button style={S.tab(activeTab === "signup")} onClick={() => { setActiveTab("signup"); setError(""); }}>SIGN UP</button>
        </div>

        {/* Info */}
        <div style={S.info}>
          <span>ℹ️</span>
          <span>{activeTab === "login" ? "Sign in to access your service requests" : "Create an account to get started"}</span>
        </div>

        {error && <div style={S.err}>{error}</div>}

        {/* ── LOGIN FORM ── */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <label style={S.label}>PHONE NUMBER OR EMAIL</label>
            <input style={S.input} type="text" name="identifier" placeholder="Enter phone number or email"
              value={loginData.identifier} onChange={handleLoginChange} required />
            <label style={S.label}>PASSWORD</label>
            <input style={S.input} type="password" name="password" placeholder="Enter your password"
              value={loginData.password} onChange={handleLoginChange} required />
            <button type="submit" style={S.submit}>LOG IN →</button>
            <div style={S.footer}>
              Don't have an account?{" "}
              <button type="button" style={S.link} onClick={handleToggle}>Sign Up</button>
            </div>
          </form>
        )}

        {/* ── SIGNUP FORM ── */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignupSubmit}>
            <label style={S.label}>USERNAME</label>
            <input style={S.input} type="text" name="username" placeholder="Choose a username"
              value={signupData.username} onChange={handleSignupChange} required />
            <label style={S.label}>PHONE NUMBER</label>
            <input style={S.input} type="text" name="phone" placeholder="Enter your phone number"
              value={signupData.phone} onChange={handleSignupChange} required />
            <label style={S.label}>EMAIL</label>
            <input style={S.input} type="email" name="email" placeholder="Enter your email"
              value={signupData.email} onChange={handleSignupChange} required />
            <label style={S.label}>PASSWORD</label>
            <input style={S.input} type="password" name="password" placeholder="Set a password"
              value={signupData.password} onChange={handleSignupChange} required />
            <button type="submit" style={S.submit}>SIGN UP →</button>
            <div style={S.footer}>
              Already have an account?{" "}
              <button type="button" style={S.link} onClick={handleToggle}>Log In</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
