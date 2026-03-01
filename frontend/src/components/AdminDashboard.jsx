// frontend/src/components/AdminDashboard.jsx
// UPDATED: Workers tab uses REAL API — approve/reject with live data

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const formatServiceType = (type) => {
  const map = {
    acRepair: "AC Repair",
    mechanicRepair: "Mechanic Repair",
    electricalRepair: "Electrical Repair",
    electronicRepair: "Electronics Repair",
    plumber: "Plumbing Services",
    packersMovers: "Packers & Movers"
  };
  return map[type] || type;
};

function Badge({ status }) {
  const colors = {
    pending: { bg: "#f59e0b22", text: "#f59e0b" },
    approved: { bg: "#10b98122", text: "#10b981" },
    rejected: { bg: "#ef444422", text: "#ef4444" },
    Active: { bg: "#10b98122", text: "#10b981" },
    Pending: { bg: "#f59e0b22", text: "#f59e0b" },
  };
  const c = colors[status] || { bg: "#6b728022", text: "#6b7280" };
  return (
    <span style={{
      background: c.bg, color: c.text,
      borderRadius: 20, padding: "3px 12px",
      fontSize: 12, fontWeight: 700, textTransform: "capitalize",
    }}>{status}</span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "24px 28px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderLeft: `5px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 800, color: "#1a2340", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</span>}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: toast.type === "success" ? "#10b981" : "#ef4444",
      color: "#fff", padding: "14px 24px", borderRadius: 12,
      fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    }}>{toast.msg}</div>
  );
}

// ── Workers View ─────────────────────────────────────────────────────────────
function Workers({ token, showToast }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionId, setActionId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // worker object
  const [rejectReason, setRejectReason] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/workers?status=${filter}`, { headers });
      setWorkers(res.data.workers);
    } catch (err) {
      showToast("Failed to load workers.", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const approve = async (worker) => {
    setActionId(worker._id);
    try {
      const res = await axios.patch(`${API}/api/admin/workers/${worker._id}/approve`, {}, { headers });
      showToast(`✅ ${worker.username} approved!`, "success");
      fetchWorkers();
    } catch {
      showToast("Failed to approve worker.", "error");
    } finally {
      setActionId(null);
    }
  };

  const reject = async () => {
    if (!rejectModal) return;
    setActionId(rejectModal._id);
    try {
      await axios.patch(`${API}/api/admin/workers/${rejectModal._id}/reject`,
        { reason: rejectReason || "Did not meet requirements." },
        { headers }
      );
      showToast(`❌ ${rejectModal.username} rejected.`, "error");
      setRejectModal(null);
      setRejectReason("");
      fetchWorkers();
    } catch {
      showToast("Failed to reject worker.", "error");
    } finally {
      setActionId(null);
    }
  };

  const filterTabs = ["pending", "approved", "rejected"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 32, width: 400,
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ margin: "0 0 8px", color: "#1a2340" }}>Reject Worker</h3>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 16px" }}>
              Rejecting <strong>{rejectModal.username}</strong>. Provide a reason (optional):
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documents, failed verification..."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                border: "1px solid #e5e7eb", fontSize: 14, fontFamily: "inherit",
                boxSizing: "border-box", resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} style={{
                padding: "10px 20px", borderRadius: 8, border: "1px solid #e5e7eb",
                background: "#f9fafb", cursor: "pointer", fontWeight: 600,
              }}>Cancel</button>
              <button onClick={reject} style={{
                padding: "10px 20px", borderRadius: 8, border: "none",
                background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 700,
              }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {filterTabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} style={{
            padding: "8px 20px", borderRadius: 20, border: "2px solid",
            borderColor: filter === tab ? "#0d7377" : "#e5e7eb",
            background: filter === tab ? "#0d7377" : "#fff",
            color: filter === tab ? "#fff" : "#374151",
            fontWeight: 700, fontSize: 13, cursor: "pointer", textTransform: "capitalize",
          }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button onClick={fetchWorkers} style={{
          marginLeft: "auto", padding: "8px 16px", borderRadius: 20,
          border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13,
        }}>🔄 Refresh</button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading workers...</div>
        ) : workers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {filter === "pending" ? "🎉" : filter === "approved" ? "👷" : "📋"}
            </div>
            <p style={{ color: "#9ca3af", fontWeight: 600 }}>
              {filter === "pending" ? "No pending workers — all caught up!" : `No ${filter} workers yet.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Name", "Email", "Phone", "Service Type", "Registered", "Status", "Actions"].map(col => (
                    <th key={col} style={{
                      padding: "12px 16px", textAlign: "left", color: "#374151",
                      fontWeight: 700, fontSize: 12, textTransform: "uppercase",
                      letterSpacing: 0.5, borderBottom: "2px solid #e5e7eb",
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workers.map((w, i) => (
                  <tr key={w._id} style={{
                    borderBottom: "1px solid #f3f4f6",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                  }}>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#1a2340" }}>{w.username}</td>
                    <td style={{ padding: "13px 16px", color: "#374151" }}>{w.email}</td>
                    <td style={{ padding: "13px 16px", color: "#374151" }}>{w.phone}</td>
                    <td style={{ padding: "13px 16px", color: "#374151" }}>
                      {w.services && w.services.length > 0
                        ? w.services.map(s => formatServiceType(s)).join(", ")
                        : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", color: "#6b7280", fontSize: 12 }}>
                      {new Date(w.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "13px 16px" }}><Badge status={w.status} /></td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {w.status === "pending" && (
                          <>
                            <button
                              onClick={() => approve(w)}
                              disabled={actionId === w._id}
                              style={{
                                background: "#10b981", color: "#fff", border: "none",
                                borderRadius: 8, padding: "6px 14px", fontWeight: 700,
                                fontSize: 12, cursor: "pointer",
                              }}
                            >{actionId === w._id ? "..." : "✅ Approve"}</button>
                            <button
                              onClick={() => setRejectModal(w)}
                              style={{
                                background: "#ef4444", color: "#fff", border: "none",
                                borderRadius: 8, padding: "6px 14px", fontWeight: 700,
                                fontSize: 12, cursor: "pointer",
                              }}
                            >❌ Reject</button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <button
                            onClick={() => setRejectModal(w)}
                            style={{
                              background: "#f3f4f6", color: "#ef4444", border: "1px solid #fecaca",
                              borderRadius: 8, padding: "6px 14px", fontWeight: 700,
                              fontSize: 12, cursor: "pointer",
                            }}
                          >Revoke</button>
                        )}
                        {w.status === "rejected" && (
                          <button
                            onClick={() => approve(w)}
                            style={{
                              background: "#f3f4f6", color: "#10b981", border: "1px solid #a7f3d0",
                              borderRadius: 8, padding: "6px 14px", fontWeight: 700,
                              fontSize: 12, cursor: "pointer",
                            }}
                          >Re-approve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dispatch Requests View ───────────────────────────────────────────────────
function DispatchRequests({ token, showToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null); // request object
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/requests/admin`, { headers });
      setRequests(res.data.data);
    } catch (err) {
      showToast("Failed to load requests.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openAssignModal = async (reqObj) => {
    setAssignModal(reqObj);
    setSelectedWorkerId("");
    try {
      // Fetch all approved workers to find available ones for this service
      const res = await axios.get(`${API}/api/admin/workers?status=approved`, { headers });
      const workers = res.data.workers.filter(w => {
        const isAvailable = w.availability === "available";
        // Strictly check if the requested serviceType is in the services array
        const matchesService = w.services && w.services.includes(reqObj.serviceType);
        return isAvailable && matchesService;
      });
      setAvailableWorkers(workers);
    } catch {
      showToast("Failed to load available workers.", "error");
    }
  };

  const confirmAssignment = async () => {
    if (!selectedWorkerId || !assignModal) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API}/api/requests/admin/${assignModal._id}/assign`, { workerId: selectedWorkerId }, { headers });
      showToast("Worker assigned successfully!", "success");
      setAssignModal(null);
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to assign worker", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Assign Modal */}
      {assignModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 32, width: 400,
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ margin: "0 0 8px", color: "#1a2340" }}>Assign Worker</h3>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 16px" }}>
              Assign a {formatServiceType(assignModal.serviceType)} worker for <strong>{assignModal.customer?.username || "Customer"}</strong>.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Available Worker</label>
              <select
                value={selectedWorkerId}
                onChange={e => setSelectedWorkerId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb" }}
              >
                <option value="">-- Choose a worker --</option>
                {availableWorkers.map(w => (
                  <option key={w._id} value={w._id}>{w.username} ({w.phone})</option>
                ))}
              </select>
              {availableWorkers.length === 0 && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>No available workers for this service type right now.</p>}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={() => setAssignModal(null)} disabled={actionLoading} style={{
                padding: "10px 20px", borderRadius: 8, border: "1px solid #e5e7eb",
                background: "#f9fafb", cursor: "pointer", fontWeight: 600,
              }}>Cancel</button>
              <button onClick={confirmAssignment} disabled={!selectedWorkerId || actionLoading} style={{
                padding: "10px 20px", borderRadius: 8, border: "none",
                background: (!selectedWorkerId || actionLoading) ? "#9ca3af" : "#10b981", color: "#fff", cursor: (!selectedWorkerId || actionLoading) ? "not-allowed" : "pointer", fontWeight: 700,
              }}>{actionLoading ? "Assigning..." : "Confirm Assign"}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 18, color: "#1a2340", margin: 0 }}>Service Requests Pipeline</h2>
        <button onClick={fetchRequests} style={{
          padding: "8px 16px", borderRadius: 20,
          border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13,
        }}>🔄 Refresh</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflowX: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No active dispatch requests.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#374151" }}>Customer</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#374151" }}>Service</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#374151" }}>Location</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#374151" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#374151" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={r._id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px" }}>{r.customer?.username}<br /><span style={{ fontSize: 11, color: "#6b7280" }}>{r.customer?.phone}</span></td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{formatServiceType(r.serviceType)}</td>
                  <td style={{ padding: "12px" }}>{r.location}<br /><span style={{ fontSize: 11, color: "#6b7280" }}>Pref: {new Date(r.preferredDate).toLocaleDateString()}</span></td>
                  <td style={{ padding: "12px" }}><Badge status={r.status} /></td>
                  <td style={{ padding: "12px" }}>
                    {r.status === "pending" ? (
                      <button onClick={() => openAssignModal(r)} style={{
                        background: "#0d7377", color: "#fff", border: "none",
                        borderRadius: 6, padding: "6px 14px", fontWeight: 700,
                        fontSize: 12, cursor: "pointer",
                      }}>Assign Worker</button>
                    ) : (
                      <span style={{ fontSize: 13, color: "#6b7280" }}>
                        Assigned: <strong>{r.assignedWorker?.username}</strong>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview({ token, showToast }) {
  const [stats, setStats] = useState(null);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/api/admin/workers/stats`, { headers })
      .then(res => setStats(res.data))
      .catch(() => showToast("Failed to load stats.", "error"));
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard label="Total Workers" value={stats?.total ?? "—"} sub="All registered" accent="#0d7377" />
        <StatCard label="Pending Approval" value={stats?.pending ?? "—"} sub="Needs your action" accent="#f59e0b" />
        <StatCard label="Approved Workers" value={stats?.approved ?? "—"} sub="Active & working" accent="#10b981" />
        <StatCard label="Rejected Workers" value={stats?.rejected ?? "—"} sub="Did not qualify" accent="#ef4444" />
      </div>

      {/* Quick action reminder */}
      {stats?.pending > 0 && (
        <div style={{
          background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12,
          padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: "#c2410c" }}>
              {stats.pending} worker{stats.pending > 1 ? "s" : ""} waiting for approval!
            </div>
            <div style={{ fontSize: 13, color: "#9a3412" }}>Go to the Workers tab to approve or reject them.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem("authToken");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Redirect if not logged in as admin
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    let role = null;
    if (userStr) {
      try {
        role = JSON.parse(userStr).role;
      } catch (e) { }
    }

    if (!token || (!adminLoggedIn && role !== "ADMIN")) {
      window.location.href = "/admin-login";
    }
  }, [token]);

  const navItems = [
    { label: "Overview", icon: "⊞" },
    { label: "Dispatch", icon: "🚀" },
    { label: "Workers", icon: "👷" },
    { label: "Settings", icon: "⚙️" },
  ];

  const logout = () => {
    localStorage.clear();
    window.location.href = "/select";
  };

  return (
    <div style={{
      display: "flex", height: "100vh",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#f0f4f8", overflow: "hidden",
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 240 : 64, minWidth: sidebarOpen ? 240 : 64,
        background: "#0d1f2d", display: "flex", flexDirection: "column",
        transition: "width 0.3s, min-width 0.3s", overflow: "hidden",
      }}>
        <div style={{ padding: "24px 16px 16px", borderBottom: "1px solid #ffffff15", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#f97316",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#fff", fontSize: 16, flexShrink: 0,
          }}>H</div>
          {sidebarOpen && (
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>HANVIKA</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>Admin Portal</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ label, icon }) => (
            <button key={label} onClick={() => setActiveTab(label)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 12px", borderRadius: 10, border: "none",
              background: activeTab === label ? "#f97316" : "transparent",
              color: activeTab === label ? "#fff" : "#94a3b8",
              fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "left",
              whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              {sidebarOpen && label}
            </button>
          ))}
        </nav>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          margin: "8px", padding: "10px", borderRadius: 8, border: "none",
          background: "#ffffff10", color: "#64748b", cursor: "pointer", fontSize: 18,
        }}>{sidebarOpen ? "◀" : "▶"}</button>

        {sidebarOpen && (
          <div style={{ padding: "16px", borderTop: "1px solid #ffffff15", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#0d7377",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 13,
            }}>A</div>
            <div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Admin User</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>Super Admin</div>
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px", background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a2340" }}>{activeTab}</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button onClick={logout} style={{
            background: "#fee2e2", color: "#ef4444", border: "none",
            borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Logout</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {activeTab === "Overview" && <Overview token={token} showToast={showToast} />}
          {activeTab === "Dispatch" && <DispatchRequests token={token} showToast={showToast} />}
          {activeTab === "Workers" && <Workers token={token} showToast={showToast} />}
          {activeTab === "Settings" && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <p style={{ color: "#6b7280" }}>Settings coming soon.</p>
            </div>
          )}
        </div>
      </div>

      <Toast toast={toast} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
