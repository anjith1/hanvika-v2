const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const { conn } = require("../db");
const createPayslipRequestModel = require("../models/PayslipRequest");
const PayslipRequest = createPayslipRequestModel(conn);
const createWorkerModel = require("../models/Worker");
const Worker = createWorkerModel(conn);

// Ensure directory exists
const uploadDir = path.join(__dirname, "../../uploads/payslips");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const workerId = req.params.id || req.user?.id || 'unknown';
        const timestamp = Date.now();
        // Example: payslip_64abc123_169000000.pdf
        const ext = path.extname(file.originalname) || ".pdf";
        cb(null, `payslip_${workerId}_${timestamp}${ext}`);
    }
});

const upload = multer({ storage });

// ── GET /api/payslips/worker (Worker sees their current pending / uploaded requests)
router.get("/worker", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const logs = await PayslipRequest.find({ workerId: req.user.id }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        console.error("Error fetching worker payslip requests:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ── POST /api/payslips/request (Worker requests a new payslip)
router.post("/request", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const workerId = req.user.id;

        // Check if worker already has a pending request
        const existingPending = await PayslipRequest.findOne({ workerId, status: "pending" });
        if (existingPending) {
            return res.status(400).json({ error: "You already have a pending payslip request" });
        }

        // Get worker name
        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({ error: "Worker not found" });
        }

        const request = new PayslipRequest({
            workerId,
            workerName: worker.username || "Worker"
        });

        await request.save();

        res.status(201).json({ message: "Payslip request submitted successfully", data: request });
    } catch (err) {
        console.error("Error creating payslip request:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ── GET /api/payslips/admin (Admin sees all requests)
router.get("/admin", verifyToken, authorizeRoles("ADMIN"), async (req, res) => {
    try {
        const requests = await PayslipRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error("Error fetching admin payslip requests:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ── POST /api/payslips/:id/upload (Admin uploads payslip file)
// 'id' is PayslipRequest ID
router.post("/:id/upload", verifyToken, authorizeRoles("ADMIN"), upload.single("payslipFile"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { id } = req.params;
        const request = await PayslipRequest.findById(id);

        if (!request) {
            // Cleanup locally uploaded file if we fail here
            fs.unlink(req.file.path, () => { });
            return res.status(404).json({ error: "Request not found" });
        }

        // Relative path to store in DB
        const relativePath = `/uploads/payslips/${req.file.filename}`;

        request.status = "uploaded";
        request.filePath = relativePath;
        await request.save();

        res.json({ message: "Payslip uploaded successfully", data: request });
    } catch (err) {
        console.error("Error uploading payslip:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ── GET /api/payslips/download/:id (Download the file)
// Workaround: We allow ADMIN or WORKER to access
router.get("/download/:id", verifyToken, authorizeRoles("WORKER", "ADMIN"), async (req, res) => {
    try {
        const request = await PayslipRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: "Payslip request not found" });
        }

        if (request.status !== "uploaded" || !request.filePath) {
            return res.status(400).json({ error: "Payslip is not available for download" });
        }

        // Enforce authorization: workers can only download their own
        if (req.user.role === "WORKER" && request.workerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Forbidden: Not your payslip" });
        }

        // filePath typically starts with /uploads/payslips/...
        // Let's resolve the absolute system path.
        const absolutePath = path.join(__dirname, "../..", request.filePath);

        if (fs.existsSync(absolutePath)) {
            res.download(absolutePath);
        } else {
            res.status(404).json({ error: "File not found on server" });
        }
    } catch (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
