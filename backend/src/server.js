require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    const allowed = ['https://your-production-domain.com'];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const t = new Date();
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`📤 ${req.method} ${req.originalUrl} → ${res.statusCode} (${new Date() - t}ms)`);
  });
  next();
});

// ── Static files ──────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get('/uploads/reviews/:filename', (req, res) => {
  res.sendFile(path.join(__dirname, 'uploads', 'reviews', req.params.filename));
});
app.get('/api/image/:filename', (req, res) => {
  res.sendFile(path.join(__dirname, 'uploads', 'reviews', req.params.filename));
});

// ── Ensure upload dirs exist ──────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Import routes ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const workerAuthRoutes = require("./routes/workerAuth");
const workerFormRoutes = require("./routes/WorkerForm");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminWorkersRoutes = require("./routes/adminWorkers.routes");
const reviewRoutes = require("./routes/reviews");
const orderRoutes = require("./routes/orders");

// ── Register routes ───────────────────────────────────────────────────────────
// ⚠️  CRITICAL ORDER: specific routes BEFORE general ones
// /api/auth/admin must be registered BEFORE /api/auth
// otherwise Express matches /api/auth first and never reaches /api/auth/admin

app.use("/api/auth/admin", adminAuthRoutes);    // ← FIRST (more specific)
app.use("/api/auth", authRoutes);          // ← SECOND (general)

app.use("/api/admin/workers", adminWorkersRoutes);
app.use("/api/worker-auth", workerAuthRoutes);
app.use("/api/worker-form", workerFormRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);

// Service requests (check file exists before requiring)
try {
  app.use("/api/requests", require("./routes/serviceRequests"));
} catch (e) {
  console.warn("⚠️  serviceRequests route not found — skipping");
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => res.send('Hanvika API server is running! ✅'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Not Found - ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
  console.log(`🔐 Admin login  → POST http://localhost:${PORT}/api/auth/admin/login`);
  console.log(`🔍 Health check → http://localhost:${PORT}/health`);
});
