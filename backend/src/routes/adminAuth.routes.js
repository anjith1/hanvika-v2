// backend/src/routes/adminAuth.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Uses your db.js conn (mongoose.createConnection) — same pattern as auth.js
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// ✅ Use YOUR connection from db.js
const { conn } = require("../db");

// Build the User model on YOUR connection.
// Guard against "Cannot overwrite model" if auth.js registered it first.
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "WORKER", "ADMIN"], default: "USER" },
});

const User = conn.models.User || conn.model("User", userSchema, "users");

// ─── POST /api/auth/admin/login ───────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;

        console.log("🔐 Admin login attempt:", email);

        // 1. All fields required
        if (!email || !password || !secretKey) {
            return res.status(400).json({ message: "Email, password and secret key are all required." });
        }

        // 2. Validate secret key against .env
        const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;
        if (!ADMIN_SECRET) {
            console.error("❌ ADMIN_SECRET_KEY missing from .env!");
            return res.status(500).json({ message: "Server misconfiguration. Contact administrator." });
        }
        if (secretKey !== ADMIN_SECRET) {
            console.warn("❌ Wrong secret key for:", email);
            return res.status(403).json({ message: "Invalid credentials or secret key." });
        }

        // 3. Find user by email (case-insensitive trim)
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            console.warn("❌ No user found:", email);
            return res.status(401).json({ message: "Invalid credentials or secret key." });
        }

        // 4. Must be ADMIN role
        if (user.role !== "ADMIN") {
            console.warn("❌ User is not ADMIN:", email, "| role:", user.role);
            return res.status(403).json({ message: "Invalid credentials or secret key." });
        }

        // 5. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn("❌ Wrong password for admin:", email);
            return res.status(401).json({ message: "Invalid credentials or secret key." });
        }

        // 6. Issue JWT
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        console.log("✅ Admin login success:", email);

        return res.json({
            token,
            user: {
                id: user._id,
                name: user.username,
                email: user.email,
                role: user.role,
            },
        });

    } catch (err) {
        console.error("Admin login error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});

module.exports = router;
