// backend/src/routes/auth.js
// Customer (USER) login & register route

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { conn } = require("../db"); // ✅ uses your createConnection from db.js

// User model on your connection
// Guard: reuse cached model if auth.js was already loaded
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER", "WORKER", "ADMIN"], default: "USER" },
});

const User = conn.models.User || conn.model("User", userSchema, "users");

// ── POST /api/auth/signup ────────────────────────────────────────────────────
// Kept for backwards compatibility with the existing frontend SignUp form
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required." });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase().trim() }, { username }] });
    if (existing) {
      return res.status(400).json({ error: "Username or email already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await User.create({
      username,
      email: email.toLowerCase().trim(),
      password: hashed,
      phone: phone || "",
      role: "USER",
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log("Login attempt with identifier:", identifier);

    if (!identifier) {
      return res.status(400).json({ error: "Username or email is required" });
    }

    // Find by username OR email
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase().trim() },
      ],
    });

    if (!user) {
      console.log("User not found:", identifier);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Block admin accounts from using the customer login
    if (user.role === "ADMIN") {
      return res.status(403).json({ error: "Please use the Admin login portal." });
    }

    // Support both bcrypt-hashed and plain-text passwords (legacy data)
    let isMatch = password === user.password;
    if (!isMatch) {
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (_) {
        /* not a valid bcrypt hash */
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/auth/test ───────────────────────────────────────────────────────
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working ✅" });
});

module.exports = router;
