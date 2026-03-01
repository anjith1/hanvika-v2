import React from "react";
import { useNavigate } from "react-router-dom";
import "./Select.css";

const roles = [
  {
    id: "partner",
    label: "SERVICE PARTNERS",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
    route: "/worker-login",
    description: "Workers & Service Providers",
    isAdmin: false,
  },
  {
    id: "customer",
    label: "CUSTOMERS",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    route: "/login",
    description: "Businesses & Individuals",
    isAdmin: false,
  },
  {
    id: "admin",
    label: "ADMIN",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5zm-1 4v2h2V9h-2zm0 4v2h2v-2h-2z" />
      </svg>
    ),
    route: "/admin-login",
    description: "Hanvika Staff Only",
    isAdmin: true,
  },
];

const Select = () => {
  const navigate = useNavigate();

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
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          HanVika -AG
        </span>
        <div style={{ display: "flex", gap: 32 }}>
          {["Home", "Services", "Client Feedback", "Login", "Contact"].map(
            (item) => (
              <span
                key={item}
                style={{
                  color:
                    item === "Login" ? "#fff" : "rgba(255,255,255,0.75)",
                  fontWeight: item === "Login" ? 700 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  borderBottom:
                    item === "Login" ? "2px solid #fff" : "none",
                  paddingBottom: 2,
                }}
              >
                {item}
              </span>
            )
          )}
        </div>
      </nav>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          gap: 32,
        }}
      >
        <h1
          style={{
            color: "#fff",
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: 6,
            margin: 0,
            textAlign: "center",
          }}
        >
          CHOOSE YOUR ROLE
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            maxWidth: 560,
          }}
        >
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.route)}
              style={{
                width: "100%",
                padding: "0 28px",
                height: 90,
                background: role.isAdmin
                  ? "linear-gradient(135deg, #1a1a3e 0%, #0d1f3c 100%)"
                  : "rgba(255,255,255,0.06)",
                border: role.isAdmin
                  ? "1px solid rgba(249,115,22,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 20,
                cursor: "pointer",
                transition: "all 0.25s",
                backdropFilter: "blur(8px)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = role.isAdmin
                  ? "linear-gradient(135deg, #1f1f4e 0%, #122040 100%)"
                  : "rgba(255,255,255,0.11)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = role.isAdmin
                  ? "rgba(249,115,22,0.7)"
                  : "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = role.isAdmin
                  ? "linear-gradient(135deg, #1a1a3e 0%, #0d1f3c 100%)"
                  : "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = role.isAdmin
                  ? "rgba(249,115,22,0.4)"
                  : "rgba(255,255,255,0.08)";
              }}
            >
              {/* Admin badge */}
              {role.isAdmin && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 14,
                    background: "#f97316",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 20,
                    letterSpacing: 1,
                  }}
                >
                  RESTRICTED
                </div>
              )}

              {/* Icon box */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: role.isAdmin
                    ? "linear-gradient(135deg, #f97316, #dc2626)"
                    : "linear-gradient(135deg, #1e40af, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {role.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 18,
                    letterSpacing: 2,
                  }}
                >
                  {role.label}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    marginTop: 3,
                  }}
                >
                  {role.description}
                </div>
              </div>

              {/* Arrow */}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 22 }}>
                ›
              </span>
            </button>
          ))}
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: 12,
            marginTop: 8,
          }}
        >
          Admin access is restricted to authorized Hanvika personnel only.
        </p>
      </div>
    </div>
  );
};

export default Select;
