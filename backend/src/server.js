require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://hanvika-frontend.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Parse JSON for non-file routes (Multer handles multipart/form-data)
app.use(express.json({ limit: '10mb' }));

// Request logger middleware
app.use((req, res, next) => {
  const startTime = new Date();
  console.log(`📥 ${req.method} ${req.originalUrl} - ${startTime.toISOString()}`);

  // Log details after the response finishes
  res.on('finish', () => {
    const duration = new Date() - startTime;
    console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add a specific route for review images to ensure they're properly served
app.get('/uploads/reviews/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', 'reviews', filename);
  res.sendFile(filePath);
});

// Add a route to handle legacy absolute paths
app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', 'reviews', filename);
  res.sendFile(filePath);
});

// Create uploads directory if it does not exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("uploads/payslips")) {
  fs.mkdirSync("uploads/payslips");
}

// Import route modules
const authRoutes = require("./routes/auth");
const workerAuthRoutes = require("./routes/workerAuth");
const workerFormRoutes = require("./routes/WorkerForm");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminWorkersRoutes = require("./routes/adminWorkers.routes");

const reviewRoutes = require("./routes/reviews");
const orderRoutes = require("./routes/orders");


// Use the routes with prefixed paths
app.use("/api/auth", authRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/admin/workers", adminWorkersRoutes);
app.use("/api/worker-auth", workerAuthRoutes);
app.use("/api/worker-form", workerFormRoutes);
app.use("/api/workers/status", require("./routes/workerStatus.routes"));

app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/requests", require("./routes/serviceRequests"));
app.use("/api/payslips", require("./routes/payslipRequests"));


// Health-check endpoint for quick server status
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// Default route for testing
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// 404 handler: handles routes that are not defined
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
});

// Global error handler for catching all errors
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Scheduled Job: Auto Delete Payslips after 7 days
cron.schedule("0 0 * * *", async () => {
  console.log("Running payslip cleanup job...");
  try {
    const { conn } = require("./db");
    const PayslipRequest = require("./models/PayslipRequest")(conn);
    const expiredRequests = await PayslipRequest.find({
      expiresAt: { $lt: new Date() },
      status: { $ne: "expired" }
    });

    for (const req of expiredRequests) {
      if (req.filePath) {
        // req.filePath typically starts with /uploads/payslips/
        const absolutePath = path.join(__dirname, "..", req.filePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }
      req.status = "expired";
      await req.save();
    }
    console.log(`Cleanup finished: ${expiredRequests.length} payslips expired/deleted.`);
  } catch (e) {
    console.error("Cron Cleanup Error:", e);
  }
});

// Start the server on PORT from environment (defaults to 5003)
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} - http://localhost:${PORT}`);
  console.log(`🛠️  API Endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check at http://localhost:${PORT}/health`);
});
