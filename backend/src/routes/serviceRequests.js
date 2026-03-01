const express = require("express");
const router = express.Router();
const { conn } = require("../db");

// Models
const ServiceRequest = require("../models/ServiceRequest")(conn);
const Worker = require("../models/Worker")(conn);

// Middleware
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ── POST /api/requests (Create Request) ──────────────────────────────────────
router.post("/", verifyToken, authorizeRoles("USER"), async (req, res) => {
    try {
        const { serviceType, location, description, preferredDate } = req.body;

        const newRequest = new ServiceRequest({
            customer: req.user.id,
            serviceType,
            location,
            description,
            preferredDate,
            status: "pending"
        });

        await newRequest.save();

        return res.status(201).json({
            success: true,
            message: "Service request created successfully",
            data: newRequest
        });
    } catch (err) {
        console.error("Create request error:", err);
        return res.status(500).json({ error: "Server error creating request" });
    }
});

// ── GET /api/requests/admin (Get All Requests) ───────────────────────────────
// (Matches the requested GET /api/admin/requests conceptually when mounted at /api/requests)
router.get("/admin", verifyToken, authorizeRoles("ADMIN"), async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate("customer", "username email phone")
            .populate("assignedWorker", "username email phone serviceType")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        console.error("Fetch requests error:", err);
        return res.status(500).json({ error: "Server error fetching requests" });
    }
});

// ── GET /api/requests/my (Customer Get Own Requests) ─────────────────────────
router.get("/my", verifyToken, authorizeRoles("USER"), async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ customer: req.user.id })
            .populate("assignedWorker", "username phone serviceType")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        console.error("Fetch customer requests error:", err);
        return res.status(500).json({ error: "Server error fetching customer requests" });
    }
});

// ── GET /api/requests/worker (Worker Get Assigned Requests) ──────────────────
router.get("/worker", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ assignedWorker: req.user.id })
            .populate("customer", "username phone email")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        console.error("Fetch worker requests error:", err);
        return res.status(500).json({ error: "Server error fetching worker requests" });
    }
});

// ── PATCH /api/requests/admin/:id/assign (Assign Worker) ─────────────────────
router.patch("/admin/:id/assign", verifyToken, authorizeRoles("ADMIN"), async (req, res) => {
    try {
        const { workerId } = req.body;
        const { id } = req.params;

        if (!workerId) {
            return res.status(400).json({ error: "Worker ID is required." });
        }

        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({ error: "Worker not found." });
        }

        if (worker.status !== "approved") {
            return res.status(400).json({ error: "Cannot assign: Worker is not approved." });
        }

        if (worker.availability !== "available") {
            return res.status(400).json({ error: "Cannot assign: Worker is currently busy." });
        }

        const request = await ServiceRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: "Service request not found." });
        }

        if (!worker.services || !worker.services.includes(request.serviceType)) {
            return res.status(400).json({ error: `Cannot assign: Worker provides [${worker.services?.join(", ")}] but request needs ${request.serviceType}.` });
        }

        // Update Request
        request.assignedWorker = worker._id;
        request.status = "assigned";
        await request.save();

        // Update Worker
        worker.availability = "busy";
        await worker.save();

        return res.status(200).json({
            success: true,
            message: "Worker assigned successfully",
            data: request
        });
    } catch (err) {
        console.error("Assign worker error:", err);
        return res.status(500).json({ error: "Server error assigning worker" });
    }
});

// ── PATCH /api/requests/worker/:id/checkin (Worker Check-In) ──────────────────
router.patch("/worker/:id/checkin", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ServiceRequest.findById(id);

        if (!request) {
            return res.status(404).json({ error: "Service request not found." });
        }

        if (request.assignedWorker.toString() !== req.user.id) {
            return res.status(403).json({ error: "Forbidden. You are not assigned to this request." });
        }

        if (request.status !== "assigned") {
            return res.status(400).json({ error: "Cannot check in. Request is not in 'assigned' state." });
        }

        request.status = "in-progress";
        request.checkInTime = new Date();
        await request.save();

        return res.status(200).json({
            success: true,
            message: "Checked in successfully",
            data: request
        });
    } catch (err) {
        console.error("Worker checkin error:", err);
        return res.status(500).json({ error: "Server error during check-in" });
    }
});

// ── PATCH /api/requests/worker/:id/checkout (Worker Check-Out) ────────────────
router.patch("/worker/:id/checkout", verifyToken, authorizeRoles("WORKER"), async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ServiceRequest.findById(id);

        if (!request) {
            return res.status(404).json({ error: "Service request not found." });
        }

        if (request.assignedWorker.toString() !== req.user.id) {
            return res.status(403).json({ error: "Forbidden. You are not assigned to this request." });
        }

        if (request.status !== "in-progress") {
            return res.status(400).json({ error: "Cannot check out. Request is not in progress." });
        }

        request.status = "completed";
        request.checkOutTime = new Date();
        await request.save();

        const worker = await Worker.findById(req.user.id);
        if (worker) {
            worker.availability = "available";
            await worker.save();
        }

        return res.status(200).json({
            success: true,
            message: "Checked out successfully",
            data: request
        });
    } catch (err) {
        console.error("Worker checkout error:", err);
        return res.status(500).json({ error: "Server error during check-out" });
    }
});

module.exports = router;
