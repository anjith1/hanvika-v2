const express = require("express");
const router = express.Router();

const { conn } = require("../db");
const createWorkerModel = require("../models/Worker");
const Worker = createWorkerModel(conn);

// Middleware
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ── PATCH /api/workers/status/online ──────────────────────────────────────────
router.patch("/online", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const workerId = req.user.id;
        const worker = await Worker.findByIdAndUpdate(
            workerId,
            { availabilityStatus: "available" },
            { new: true }
        ).select("-password");

        if (!worker) {
            return res.status(404).json({ error: "Worker not found." });
        }

        res.json({ message: "Status updated to Available", data: worker });
    } catch (err) {
        console.error("Online status error:", err);
        res.status(500).json({ error: "Server error updating status." });
    }
});

// ── PATCH /api/workers/status/offline ─────────────────────────────────────────
router.patch("/offline", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const workerId = req.user.id;
        const worker = await Worker.findByIdAndUpdate(
            workerId,
            { availabilityStatus: "offline" },
            { new: true }
        ).select("-password");

        if (!worker) {
            return res.status(404).json({ error: "Worker not found." });
        }

        res.json({ message: "Status updated to Offline", data: worker });
    } catch (err) {
        console.error("Offline status error:", err);
        res.status(500).json({ error: "Server error updating status." });
    }
});

// ── PATCH /api/workers/status/leave ───────────────────────────────────────────
router.patch("/leave", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const workerId = req.user.id;
        // Optionally check if the worker is "busy" before allowing leave
        const existingWorker = await Worker.findById(workerId);

        if (!existingWorker) {
            return res.status(404).json({ error: "Worker not found." });
        }

        if (existingWorker.availabilityStatus === "busy") {
            return res.status(400).json({ error: "Cannot take leave while assigned to an active job." });
        }

        const worker = await Worker.findByIdAndUpdate(
            workerId,
            { availabilityStatus: "on_leave" },
            { new: true }
        ).select("-password");

        res.json({ message: "Status updated to On Leave", data: worker });
    } catch (err) {
        console.error("Leave status error:", err);
        res.status(500).json({ error: "Server error updating status." });
    }
});

module.exports = router;
