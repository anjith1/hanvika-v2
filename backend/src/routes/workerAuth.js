// backend/src/routes/workerAuth.js
// UPDATED: Blocks unapproved workers from logging in

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { conn } = require("../db");
const createWorkerModel = require("../models/Worker");
const Worker = createWorkerModel(conn);

// ── POST /api/worker-auth/signup ─────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { username, phone, email, password, serviceType } = req.body;

    // Check duplicate
    const existingWorker = await Worker.findOne({
      $or: [{ username }, { email }],
    });
    if (existingWorker) {
      return res.status(400).json({ error: "Username or email already taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create worker — status defaults to "pending"
    const newWorker = new Worker({
      username,
      phone,
      email,
      password: hashedPassword,
      serviceType: serviceType || "",
      status: "pending",  // ← always starts pending, admin must approve
    });

    await newWorker.save();

    return res.status(201).json({
      message: "Registration successful! Your account is pending admin approval. You will be able to login once approved.",
      status: "pending",
    });
  } catch (error) {
    console.error("Worker signup error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/worker-auth/login ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Username or email is required" });
    }

    // Find worker
    const worker = await Worker.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!worker) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ── APPROVAL CHECK ────────────────────────────────────────────────────────
    if (worker.status === "pending") {
      return res.status(403).json({
        error: "Your account is pending admin approval. Please wait for approval before logging in.",
        status: "pending",
      });
    }

    if (worker.status === "rejected") {
      return res.status(403).json({
        error: `Your account was rejected. Reason: ${worker.rejectionReason || "Contact admin for details."}`,
        status: "rejected",
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Check password
    let isMatch = false;
    if (password === worker.password) {
      isMatch = true; // legacy plain text
    } else {
      try {
        isMatch = await bcrypt.compare(password, worker.password);
      } catch (err) {
        console.error("Bcrypt comparison failed:", err);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { workerId: worker._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: worker.username,
        email: worker.email,
        phone: worker.phone,
        serviceType: worker.serviceType,
        status: worker.status,
      },
    });
  } catch (error) {
    console.error("Worker login error:", error);
    return res.status(500).json({ error: "An error occurred during login. Please try again." });
  }
});

module.exports = router;
