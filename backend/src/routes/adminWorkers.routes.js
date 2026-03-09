// backend/src/routes/adminWorkers.routes.js
// NEW FILE: Admin API to list, approve, reject workers

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { conn } = require("../db");
const createWorkerModel = require("../models/Worker");
const Worker = createWorkerModel(conn);
const WorkerForm = require("../models/WorkerForm");

// ── Admin Auth Middleware (inline) ───────────────────────────────────────────
function adminOnly(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided." });
    }
    try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        if (decoded.role !== "ADMIN") {
            return res.status(403).json({ message: "Admin access required." });
        }
        req.admin = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

// ── GET /api/admin/workers ───────────────────────────────────────────────────
// Get all workers (filter by status)
router.get("/", adminOnly, async (req, res) => {
    try {
        const { status, availability } = req.query; // ?status=pending | ?availability=available
        const filter = {};
        if (status) filter.status = status;
        if (availability) filter.availabilityStatus = availability;
        const workers = await Worker.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({ workers, total: workers.length });
    } catch (err) {
        console.error("Get workers error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// ── GET /api/admin/workers/stats ─────────────────────────────────────────────
// Get counts for dashboard stats
router.get("/stats", adminOnly, async (req, res) => {
    try {
        const [total, pending, approved, rejected] = await Promise.all([
            Worker.countDocuments(),
            Worker.countDocuments({ status: "pending" }),
            Worker.countDocuments({ status: "approved" }),
            Worker.countDocuments({ status: "rejected" }),
        ]);
        res.json({ total, pending, approved, rejected });
    } catch (err) {
        res.status(500).json({ message: "Server error." });
    }
});

// ── PATCH /api/admin/workers/:id/approve ────────────────────────────────────
router.patch("/:id/approve", adminOnly, async (req, res) => {
    try {
        const workerToApprove = await Worker.findById(req.params.id);
        if (!workerToApprove) return res.status(404).json({ message: "Worker not found." });

        if (workerToApprove.status === "approved") {
            return res.status(400).json({ message: "Worker is already approved." });
        }

        // Fetch corresponding WorkerForm by email
        const workerForm = await WorkerForm.findOne({ email: workerToApprove.email });

        if (!workerForm) {
            return res.status(400).json({ message: "Worker profile (WorkerForm) not found. Cannot approve without services." });
        }

        // Extract services from workerTypes
        const validServices = [
            "acRepair",
            "mechanicRepair",
            "electricalRepair",
            "electronicRepair",
            "plumber",
            "packersMovers"
        ];

        let extractedServices = [];
        if (workerForm.workerTypes) {
            for (const [key, isSelected] of Object.entries(workerForm.workerTypes)) {
                if (isSelected === true && validServices.includes(key)) {
                    extractedServices.push(key);
                }
            }
        }

        if (extractedServices.length === 0) {
            return res.status(400).json({ message: "Worker has no valid services selected. Cannot approve." });
        }

        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            {
                status: "approved",
                approvedAt: new Date(),
                rejectionReason: "",
                services: extractedServices
            },
            { new: true }
        ).select("-password");

        console.log(`✅ Worker approved: ${worker.username} with services: ${extractedServices.join(", ")}`);
        res.json({ message: `${worker.username} has been approved!`, worker });
    } catch (err) {
        console.error("Approve error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// ── PATCH /api/admin/workers/:id/reject ─────────────────────────────────────
router.patch("/:id/reject", adminOnly, async (req, res) => {
    try {
        const { reason } = req.body;
        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            {
                status: "rejected",
                rejectionReason: reason || "Did not meet requirements.",
                approvedAt: null,
            },
            { new: true }
        ).select("-password");

        if (!worker) return res.status(404).json({ message: "Worker not found." });

        console.log(`❌ Worker rejected: ${worker.username}`);
        res.json({ message: `${worker.username} has been rejected.`, worker });
    } catch (err) {
        console.error("Reject error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// ── DELETE /api/admin/workers/:id ───────────────────────────────────────────
router.delete("/:id", adminOnly, async (req, res) => {
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if (!worker) return res.status(404).json({ message: "Worker not found." });
        res.json({ message: `${worker.username} has been deleted.` });
    } catch (err) {
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
