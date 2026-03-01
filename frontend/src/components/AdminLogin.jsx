// src/components/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", secretKey: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.secretKey) {
            setError("All fields are required.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/admin/login`,
                form
            );
            // Store admin session
            localStorage.setItem("authToken", res.data.token);
            localStorage.setItem("adminLoggedIn", "true");
            localStorage.setItem(
                "currentUser",
                JSON.stringify({ ...res.data.user, role: "ADMIN" })
            );
            navigate("/admin");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Invalid credentials or secret key."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #0a1628 100%)",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}
        >
            {/* Navbar */}
            <nav
                style={{
                    background: "linear-gradient(90deg, #1a237e 0%, #00897b 100%)",
                    padding: "0 40px",
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span
                    onClick={() => navigate("/select")}
                    style={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 22,
                        letterSpacing: 1,
                        cursor: "pointer",
                    }}
                >
                    HanVika -AG
                </span>
                <button
                    onClick={() => navigate("/select")}
                    style={{
                        background: "rgba(255,255,255,0.12)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 8,
                        padding: "7px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    ← Back to Role Selection
                </button>
            </nav>

            {/* Card */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: 440,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(249,115,22,0.25)",
                        borderRadius: 20,
                        padding: "40px 36px",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                    }}
                >
                    {/* Shield Icon */}
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                margin: "0 auto 12px",
                                background: "linear-gradient(135deg, #f97316, #dc2626)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 30,
                                boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
                            }}
                        >
                            🛡️
                        </div>
                        <h2
                            style={{
                                color: "#fff",
                                margin: 0,
                                fontSize: 24,
                                fontWeight: 800,
                                letterSpacing: 2,
                            }}
                        >
                            ADMIN LOGIN
                        </h2>
                        <p
                            style={{
                                color: "rgba(255,255,255,0.35)",
                                fontSize: 13,
                                margin: "6px 0 0",
                            }}
                        >
                            Authorized Personnel Only
                        </p>
                    </div>

                    {/* Restricted banner */}
                    <div
                        style={{
                            background: "rgba(249,115,22,0.1)",
                            border: "1px solid rgba(249,115,22,0.3)",
                            borderRadius: 8,
                            padding: "10px 14px",
                            marginBottom: 24,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <span
                            style={{ color: "#fb923c", fontSize: 12, fontWeight: 600 }}
                        >
                            This area is restricted. Unauthorized access attempts are logged.
                        </span>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: 16 }}
                    >
                        {/* Email */}
                        <div>
                            <label
                                style={{
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    display: "block",
                                    marginBottom: 6,
                                }}
                            >
                                ADMIN EMAIL
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="admin@hanvika.com"
                                value={form.email}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    color: "#fff",
                                    fontSize: 14,
                                    outline: "none",
                                    boxSizing: "border-box",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                style={{
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    display: "block",
                                    marginBottom: 6,
                                }}
                            >
                                PASSWORD
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    name="password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "12px 44px 12px 16px",
                                        borderRadius: 10,
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        color: "#fff",
                                        fontSize: 14,
                                        outline: "none",
                                        boxSizing: "border-box",
                                        fontFamily: "inherit",
                                    }}
                                />
                                <span
                                    onClick={() => setShowPass(!showPass)}
                                    style={{
                                        position: "absolute",
                                        right: 14,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer",
                                        fontSize: 18,
                                        color: "rgba(255,255,255,0.4)",
                                    }}
                                >
                                    {showPass ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>

                        {/* Secret Key */}
                        <div>
                            <label
                                style={{
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    display: "block",
                                    marginBottom: 6,
                                }}
                            >
                                SECRET KEY <span style={{ color: "#f97316" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    name="secretKey"
                                    type={showKey ? "text" : "password"}
                                    placeholder="Enter admin secret key"
                                    value={form.secretKey}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "12px 44px 12px 16px",
                                        borderRadius: 10,
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(249,115,22,0.25)",
                                        color: "#fff",
                                        fontSize: 14,
                                        outline: "none",
                                        boxSizing: "border-box",
                                        fontFamily: "inherit",
                                    }}
                                />
                                <span
                                    onClick={() => setShowKey(!showKey)}
                                    style={{
                                        position: "absolute",
                                        right: 14,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer",
                                        fontSize: 18,
                                        color: "rgba(255,255,255,0.4)",
                                    }}
                                >
                                    {showKey ? "🙈" : "👁️"}
                                </span>
                            </div>
                            <p
                                style={{
                                    color: "rgba(255,255,255,0.25)",
                                    fontSize: 11,
                                    margin: "6px 0 0",
                                }}
                            >
                                Secret key is provided by Hanvika management only.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                style={{
                                    background: "rgba(239,68,68,0.12)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: 8,
                                    padding: "10px 14px",
                                    color: "#f87171",
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                ⛔ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: 8,
                                width: "100%",
                                padding: "14px",
                                background: loading
                                    ? "rgba(249,115,22,0.4)"
                                    : "linear-gradient(135deg, #f97316, #dc2626)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                fontWeight: 800,
                                fontSize: 15,
                                cursor: loading ? "not-allowed" : "pointer",
                                letterSpacing: 1,
                                boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
                                transition: "all 0.2s",
                                fontFamily: "inherit",
                            }}
                        >
                            {loading ? "Verifying..." : "🔐 ACCESS ADMIN PANEL"}
                        </button>
                    </form>

                    <p
                        style={{
                            textAlign: "center",
                            color: "rgba(255,255,255,0.2)",
                            fontSize: 12,
                            marginTop: 20,
                        }}
                    >
                        Not an admin?{" "}
                        <span
                            onClick={() => navigate("/select")}
                            style={{ color: "#60a5fa", cursor: "pointer" }}
                        >
                            Go back
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
