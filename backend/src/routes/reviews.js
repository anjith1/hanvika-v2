// backend/src/routes/reviews.js — MongoDB-based reviews API
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { conn } = require("../db");
const createReviewModel = require("../models/Review");
const Review = createReviewModel(conn);

// ── Auth middleware ──────────────────────────────────────────────
function authUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    if (decoded.role !== "ADMIN")
      return res.status(403).json({ message: "Admin only" });
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ── POST /api/reviews ─────────────────────────────────────────────
// Customer submits review for a completed job
router.post("/", authUser, async (req, res) => {
  try {
    const {
      workerId, workerName, workerPhone,
      requestId, serviceType,
      rating, comment, jobDate, customerName
    } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1-5" });

    // Prevent duplicate reviews
    const existing = await Review.findOne({
      customerId: req.user.userId || req.user.id,
      requestId
    });
    if (existing)
      return res.status(400).json({ message: "You already reviewed this job" });

    const review = new Review({
      customerId: req.user.userId || req.user.id,
      customerName: customerName || "Customer",
      workerId,
      workerName,
      workerPhone: workerPhone || "",
      requestId,
      serviceType,
      rating,
      comment: comment || "",
      jobDate: jobDate ? new Date(jobDate) : new Date(),
    });

    await review.save();
    res.status(201).json({ message: "Review submitted!", review });
  } catch (err) {
    console.error("Review POST error:", err);
    if (err.code === 11000)
      return res.status(400).json({ message: "Already reviewed this job" });
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ── GET /api/reviews ──────────────────────────────────────────────
// Get all reviews (public — for Client Feedback page)
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ── GET /api/reviews/my ───────────────────────────────────────────
// Get current customer's reviewed request IDs
router.get("/my", authUser, async (req, res) => {
  try {
    const reviews = await Review.find(
      { customerId: req.user.userId || req.user.id },
      { requestId: 1, _id: 0 }
    );
    const reviewedIds = reviews.map(r => r.requestId);
    res.json({ reviewedIds });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ── GET /api/reviews/workers/summary ─────────────────────────────
// Admin: get all workers with their avg rating + review count
// MUST be before /:id params route
router.get("/workers/summary", adminOnly, async (req, res) => {
  try {
    const summary = await Review.aggregate([
      {
        $group: {
          _id: "$workerId",
          workerName: { $first: "$workerName" },
          workerPhone: { $first: "$workerPhone" },
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    res.json({ workers: summary });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ── GET /api/reviews/worker/:workerId ─────────────────────────────
// Get all reviews for a specific worker
router.get("/worker/:workerId", async (req, res) => {
  try {
    const reviews = await Review.find({ workerId: req.params.workerId })
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ reviews, avgRating, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ── DELETE /api/reviews/:id ────────────────────────────────────────
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;